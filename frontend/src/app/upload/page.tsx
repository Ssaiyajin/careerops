"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { uploadResume } from "@/lib/api/rewrite";
import { setResumeData } from "@/store/resumeStore";

import BackgroundEffects from "@/components/ui/BackgroundEffects";
import PageContainer from "@/components/ui/PageContainer";

import { useAuthGuard } from "@/lib/auth/auth-guard";
export default function UploadPage() {
  const router = useRouter();
  useAuthGuard();

  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const [jobDescription, setJobDescription] = useState("");
  const [aiProcessingConsent, setAiProcessingConsent] = useState(false);

  const handleFileChange = async (
  event: React.ChangeEvent<HTMLInputElement>
    ) => {

      const file = event.target.files?.[0];

      if (!file) return;
      setFileName(file.name);

      setUploading(true);
      setStatus("Uploading resume...");
      setProgress(15);

      try {

        // fake smooth progress
        const progressInterval = setInterval(() => {

          setProgress((prev) => {

            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }

            return prev + 10;
          });

        }, 300);
        
        // REAL backend upload

        setStatus("Uploading Resume...");
        setProgress(20);

        await new Promise((r) => setTimeout(r, 500));

        setStatus("Extracting Skills...");
        setProgress(40);

        await new Promise((r) => setTimeout(r, 500));

        setStatus("Calculating ATS Score...");
        setProgress(60);

        await new Promise((r) => setTimeout(r, 500));

        setStatus("Running AI Analysis...");
        setProgress(80);

        const data = await uploadResume(file, jobDescription);

        setStatus("Analysis Complete");
        setProgress(100);

        setResumeData({ ...data, job_description: jobDescription });

        setTimeout(() => {
          router.push("/results");
        }, 1000);
        
        event.target.value = "";

      } catch (error) {

        event.target.value = "";
        setStatus(
          error instanceof Error
            ? error.message
            : "Resume upload failed. Please try again."
        );

        setUploading(false);
      }
    };

    
  return (
    <main className="relative min-h-screen overflow-x-clip overflow-y-visible bg-black text-white">

      <BackgroundEffects variant="upload" />

      <PageContainer>
      <div className="flex w-full min-w-0 flex-col items-center text-center">
        {/* Header */}
        <div className="text-center">

          <div className="mb-8  items-center justify-center rounded-full border border-green-400/30 bg-green-400/5 px-14 pt-3 pb-[14px] text-base text-green-300 backdrop-blur-sm">
            AI Resume Upload
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Upload Resume
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Upload your resume and begin your AI-powered
            career analysis journey.
          </p>

        </div>
        {/* JOB DESCRIPTION */}
        <div className="mx-auto mt-12 w-full max-w-4xl">

          <label className="mb-3 block text-center text-sm text-white/70">
            Paste Job Description
          </label>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste LinkedIn or company job description here..."
            className="
              mx-auto
              block
              h-64
              w-full
              rounded-2xl
              border
              border-white/10
              bg-black/40
              p-5
              text-white
              outline-none
              backdrop-blur-sm
              focus:border-green-400
            "
          />

        </div>
        {/* Upload Card */}
        <div
          className="
          box-border
          min-w-0
          mt-14
          mb-20
          w-full
          mx-auto
          max-w-4xl
          rounded-3xl
          border
          border-green-400/20
          bg-white/5
          p-5
          sm:p-8
          backdrop-blur-xl
          transition-all
          duration-500
          hover:border-green-400/50
          hover:shadow-[0_0_80px_rgba(34,197,94,0.12)]
          " 
        >
        {/* Upload Area */}
          <label
            className="
            group
            relative
            flex
            h-64
            sm:h-72
            w-full
            cursor-pointer
            flex-col
            items-center
            justify-center
            overflow-hidden
            rounded-3xl
            border
            border-dashed
            border-green-400/30
            bg-black/30
            transition-all
            duration-500
            hover:border-green-400
            hover:bg-black/40
            hover:shadow-[0_0_60px_rgba(34,197,94,0.12)]
          "
          >
          {/* animated background glow */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400/10 blur-3xl animate-pulse" />
          </div>

          
            <input
              type="file"
              accept=".pdf"
              data-testid="upload-file-input"
              onChange={handleFileChange}
              disabled={!aiProcessingConsent || uploading}
              className="sr-only"
            />

            {/* Upload Icon */}
            <div className="rounded-full bg-green-500/10 p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-12 w-12 text-green-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16V4m0 0l-4 4m4-4l4 4M4 16.5v1.125C4 18.936 5.064 20 6.375 20h11.25C18.936 20 20 18.936 20 17.625V16.5"
                />
              </svg>
            </div>

            <h2 className="mt-8 text-2xl font-semibold">
              Upload Resume
            </h2>

            <p className="mt-3 text-white/60">
              Drag & Drop or Click to Upload PDF
            </p>

            {/* File Name */}
            {fileName && (
              <div className="mt-6 max-w-[90%] truncate rounded-full bg-green-500/10 px-5 py-2 text-sm text-green-300 ">
                {fileName}
              </div>
            )}

          </label>

          <label className="mt-6 flex items-start gap-3 text-left text-sm text-white/70">
            <input
              type="checkbox"
              checked={aiProcessingConsent}
              onChange={(event) => setAiProcessingConsent(event.target.checked)}
              className="mt-1 accent-green-500"
            />
            <span>
              I understand that my resume text is sent to an AI model for recommendations and rewriting. If I generate a cover letter, my resume text and job description are also sent to an AI model. CareerOps retains my extracted resume for up to 90 days or until I delete my account; provider backups may retain deleted data for up to 30 days.
            </span>
          </label>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-8 box-border w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-5">

              <div className="mb-4 text-center">

                <p className="text-green-300 font-medium animate-pulse">
                  {status}
                </p>

              </div>

              <div className="mb-3 flex min-w-0 justify-between gap-3 text-sm text-white/60">
                <span className="truncate">CareerOps Processing</span>
                <span className="shrink-0">{progress}%</span>
              </div>

              <div
                role="progressbar"
                aria-label="Resume analysis progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="box-border h-3 w-full min-w-0 overflow-hidden rounded-full bg-white/10"
              >

                <div
                  className="
                    max-w-full
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-green-400
                    to-emerald-500
                    transition-all
                    duration-300
                  "
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>
          )}
          {!uploading && status && status !== "Analysis Complete" && (
            <p role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-left text-sm text-red-200">
              {status}
            </p>
          )}
                
        </div>
      </div>
      </PageContainer>

    </main>
  );
}