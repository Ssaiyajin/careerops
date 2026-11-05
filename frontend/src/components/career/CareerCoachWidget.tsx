"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  generateInterviewPrep,
  generateLearningPlan,
  getLatestCareerContext,
  sendCareerChat,
} from "@/lib/api/careerCoach";

type Mode = "chat" | "interview" | "learning";
type Message = {
  role: "user" | "assistant";
  content: string;
};

function CoachAvatar({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`career-coach-orb ${small ? "career-coach-orb-small" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 96 96" role="img" aria-label="CareerOps coach bot">
        <defs>
          <linearGradient id="coach-armor" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#d9ffe9" />
            <stop offset="1" stopColor="#60e6a1" />
          </linearGradient>
          <linearGradient id="coach-face" x1="0" x2="0.9" y1="0" y2="1">
            <stop offset="0" stopColor="#203943" />
            <stop offset="1" stopColor="#08141c" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="44" fill="#071511" />
        <path
          d="M17 37 29 14l9 11 11-17 8 18 15-12-2 22 13 8-11 7H23l-9-9z"
          fill="url(#coach-armor)"
          stroke="#c4ffde"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M26 40q22-10 44 0l-4 28q-18 17-36 0z"
          fill="url(#coach-face)"
          stroke="#b6f5d1"
          strokeWidth="2"
        />
        <path
          d="M34 52h10m8 0h10"
          stroke="#7cf7bd"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path
          d="M40 64q8 5 16 0"
          fill="none"
          stroke="#b6f5d1"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M19 54q-7 9 2 17m56-17q7 9-2 17"
          fill="none"
          stroke="#8efac1"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <circle cx="48" cy="81" r="3" fill="#e1ffed" />
      </svg>
    </span>
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The request could not be completed. Please try again.";
}

export default function CareerCoachWidget() {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [contextStatus, setContextStatus] = useState("");
  const [goal, setGoal] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => {
        if (active) setAuthenticated(response.ok);
      })
      .catch(() => {
        if (active) setAuthenticated(false);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (open && transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages, open, pending]);

  if (!authenticated) return null;

  const addAssistantAnswer = (userPrompt: string, answer: string) => {
    setMessages((current) => [
      ...current,
      { role: "user", content: userPrompt },
      { role: "assistant", content: answer },
    ]);
  };

  const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = message.trim();
    if (!prompt || pending) return;

    setPending(true);
    setError("");
    try {
      const result = await sendCareerChat({
        message: prompt,
        history: messages.slice(-10),
        resume_text: resumeText,
        job_description: jobDescription,
        target_role: targetRole,
      });
      addAssistantAnswer(prompt, result.answer);
      setMessage("");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  const handleInterviewPrep = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await generateInterviewPrep({
        target_role: targetRole,
        focus_area: "balanced",
        resume_text: resumeText,
        job_description: jobDescription,
      });
      addAssistantAnswer(`Prepare me for a ${targetRole} interview.`, result.answer);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  const handleLearningPlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const result = await generateLearningPlan({
        goal,
        target_role: targetRole,
        current_skills: currentSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        duration_weeks: durationWeeks,
        hours_per_week: hoursPerWeek,
        resume_text: resumeText,
        job_description: jobDescription,
      });
      addAssistantAnswer(`Build me a ${durationWeeks}-week plan for: ${goal}`, result.answer);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  const loadLatestResume = async () => {
    setError("");
    setContextStatus("Loading your latest resume...");
    try {
      const context = await getLatestCareerContext();
      if (!context.available) {
        setContextStatus("No analyzed resume was found. You can paste context below.");
        return;
      }
      setResumeText(context.resume_text);
      setContextStatus("Latest analyzed resume loaded for this session.");
    } catch (requestError) {
      setContextStatus("");
      setError(errorMessage(requestError));
    }
  };

  const commonContext = (
    <details
      className="career-coach-context"
      open={contextOpen}
      onToggle={(event) => setContextOpen(event.currentTarget.open)}
    >
      <summary>Personalize with your career context (optional)</summary>
      <div className="mt-3 grid gap-3">
        {mode !== "interview" && (
          <label className="career-coach-label">
            Target role
            <input
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              maxLength={160}
              placeholder="e.g. Junior cloud engineer"
              className="career-coach-field"
            />
          </label>
        )}
        <label className="career-coach-label">
          Job description
          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            maxLength={12000}
            rows={3}
            placeholder="Paste the role requirements for tailored advice."
            className="career-coach-field resize-y"
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-white/50">
            Resume context stays in this browser session.
          </span>
          <button
            type="button"
            onClick={loadLatestResume}
            className="career-coach-secondary"
          >
            Use latest analyzed resume
          </button>
        </div>
        {contextStatus && (
          <p role="status" className="text-xs text-green-200/80">
            {contextStatus}
          </p>
        )}
        <label className="career-coach-label">
          Resume context
          <textarea
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            maxLength={30000}
            rows={4}
            placeholder="Paste resume text, or load your latest analyzed resume."
            className="career-coach-field resize-y"
          />
        </label>
        <p className="text-xs leading-relaxed text-amber-100/65">
          When you send a coaching request, any context above is sent to Google
          Gemini to generate your response. Chats are not saved by CareerOps.
        </p>
      </div>
    </details>
  );

  return (
    <div className="career-coach-widget">
      {open && (
        <section
          aria-label="Saiyan Foundation and CareerOps career coach"
          aria-modal="false"
          className="career-coach-panel"
          role="dialog"
        >
          <div className="career-coach-header">
            <CoachAvatar small />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                Saiyan Foundation × CareerOps
              </p>
              <p className="text-xs text-green-100/65">Gemini-powered career coach</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="career-coach-close"
              aria-label="Close career coach"
            >
              ×
            </button>
          </div>
          <p className="px-4 pt-2 text-xs leading-relaxed text-amber-100/60">
            Optional resume or job context is sent to Google Gemini when you
            submit a request. Conversations are not saved by CareerOps.
          </p>

          <div className="career-coach-tabs" role="tablist" aria-label="Coach tools">
            {(
              [
                ["chat", "Career chat"],
                ["interview", "Interview prep"],
                ["learning", "Learning plan"],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={mode === tab}
                onClick={() => {
                  setMode(tab);
                  setError("");
                }}
                className={`career-coach-tab ${mode === tab ? "career-coach-tab-active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div ref={transcriptRef} className="career-coach-transcript" aria-live="polite">
            {messages.length === 0 ? (
              <div className="career-coach-welcome">
                <p className="font-medium text-white">Your next move starts here.</p>
                <p className="mt-1 text-sm text-white/60">
                  Ask about your career, practice for an interview, or build a
                  realistic learning plan.
                </p>
              </div>
            ) : (
              messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`career-coach-message ${
                    item.role === "user" ? "career-coach-message-user" : ""
                  }`}
                >
                  {item.content}
                </div>
              ))
            )}
            {pending && (
              <p className="text-sm text-green-100/70" role="status">
                Career coach is thinking…
              </p>
            )}
          </div>

          {commonContext}

          {error && (
            <p className="career-coach-error" role="alert">
              {error}
            </p>
          )}

          {mode === "chat" && (
            <form onSubmit={handleChatSubmit} className="career-coach-compose">
              <label className="sr-only" htmlFor="career-coach-message">
                Message the career coach
              </label>
              <textarea
                id="career-coach-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={4000}
                rows={2}
                placeholder="Ask about your next career move..."
                className="career-coach-field min-h-14 resize-none"
                disabled={pending}
              />
              <button
                type="submit"
                disabled={pending || !message.trim()}
                className="career-coach-primary"
              >
                Send
              </button>
            </form>
          )}

          {mode === "interview" && (
            <form onSubmit={handleInterviewPrep} className="career-coach-form">
              <label className="career-coach-label">
                Interview role
                <input
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  minLength={2}
                  maxLength={160}
                  required
                  placeholder="e.g. Platform engineer"
                  className="career-coach-field"
                />
              </label>
              <p className="text-xs text-white/60">
                Get role-specific questions, answer guidance, and a short practice plan.
              </p>
              <button
                type="submit"
                disabled={pending || targetRole.trim().length < 2}
                className="career-coach-primary w-full"
              >
                Generate interview prep
              </button>
            </form>
          )}

          {mode === "learning" && (
            <form onSubmit={handleLearningPlan} className="career-coach-form">
              <label className="career-coach-label">
                What do you want to learn or achieve?
                <input
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  minLength={3}
                  maxLength={1000}
                  required
                  placeholder="e.g. Build skills for an entry-level data analyst role"
                  className="career-coach-field"
                />
              </label>
              <label className="career-coach-label">
                Skills you already have
                <input
                  value={currentSkills}
                  onChange={(event) => setCurrentSkills(event.target.value)}
                  placeholder="e.g. Excel, SQL basics"
                  className="career-coach-field"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="career-coach-label">
                  Duration (weeks)
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={durationWeeks}
                    onChange={(event) => setDurationWeeks(Number(event.target.value))}
                    className="career-coach-field"
                  />
                </label>
                <label className="career-coach-label">
                  Hours per week
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={hoursPerWeek}
                    onChange={(event) => setHoursPerWeek(Number(event.target.value))}
                    className="career-coach-field"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={pending || goal.trim().length < 3}
                className="career-coach-primary w-full"
              >
                Build my learning plan
              </button>
            </form>
          )}
          <p className="career-coach-disclaimer">
            AI guidance can be inaccurate. Review advice before acting.
          </p>
        </section>
      )}

      <button
        type="button"
        aria-label={open ? "Close career coach" : "Open Saiyan Foundation CareerOps coach"}
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="career-coach-launcher"
      >
        <CoachAvatar />
      </button>
    </div>
  );
}
