type ResumePreviewLine =
  | { kind: "heading"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "entry"; text: string }
  | { kind: "body"; text: string };

const SECTION_HEADINGS = new Set([
  "SUMMARY",
  "PROFESSIONAL SUMMARY",
  "PROFILE",
  "PROFESSIONAL PROFILE",
  "OBJECTIVE",
  "CAREER OBJECTIVE",
  "TECHNICAL SKILLS",
  "SKILLS",
  "CORE SKILLS",
  "CORE COMPETENCIES",
  "PROFESSIONAL EXPERIENCE",
  "WORK EXPERIENCE",
  "EXPERIENCE",
  "PROJECTS",
  "EDUCATION",
  "CERTIFICATIONS",
  "CERTIFICATES",
  "LANGUAGES",
  "AWARDS",
  "ACHIEVEMENTS",
  "PUBLICATIONS",
  "VOLUNTEER EXPERIENCE",
  "VOLUNTEERING",
  "ADDITIONAL INFORMATION",
]);

const ENTRY_SECTIONS = new Set([
  "PROFESSIONAL EXPERIENCE",
  "WORK EXPERIENCE",
  "EXPERIENCE",
  "PROJECTS",
  "EDUCATION",
]);

function parseContentLines(lines: string[]): ResumePreviewLine[] {
  let currentSection = "";
  const parsed: ResumePreviewLine[] = [];

  for (const line of lines) {
    const heading = line.replace(/:$/, "").toUpperCase();
    if (SECTION_HEADINGS.has(heading)) {
      currentSection = heading;
      parsed.push({ kind: "heading", text: heading });
      continue;
    }

    const bullet = line.match(/^\s*(?:[•●▪◦*-])\s+(.+)$/);
    if (bullet) {
      parsed.push({ kind: "bullet", text: bullet[1] });
      continue;
    }

    parsed.push({
      kind:
        ENTRY_SECTIONS.has(currentSection) && line.includes(" | ")
          ? "entry"
          : "body",
      text: line,
    });
  }

  return parsed;
}

export default function ResumePreview({ text }: { text: string }) {
  const visibleLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const firstSectionIndex = visibleLines.findIndex((line) =>
    SECTION_HEADINGS.has(line.replace(/:$/, "").toUpperCase())
  );
  const headerLines = visibleLines.slice(
    0,
    firstSectionIndex === -1 ? 1 : firstSectionIndex
  );
  const contentLines =
    firstSectionIndex === -1
      ? visibleLines.slice(1)
      : visibleLines.slice(firstSectionIndex);
  const parsedContent = parseContentLines(contentLines);

  return (
    <div
      className="mt-6 max-h-[520px] overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-3 sm:p-5"
      data-testid="resume-preview"
    >
      <article className="mx-auto min-h-[480px] max-w-[760px] bg-white px-6 py-8 text-slate-700 shadow-2xl sm:px-12 sm:py-10">
        {headerLines[0] && (
          <h2 className="break-words text-center font-sans text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {headerLines[0]}
          </h2>
        )}
        {headerLines.slice(1).map((line, index) => (
          <p
            key={`${index}-${line}`}
            className="mt-1 break-words text-center text-xs text-slate-500 sm:text-sm"
          >
            {line}
          </p>
        ))}
        <div className="mt-5 h-1 rounded-full bg-teal-700" />

        <div className="mt-5 space-y-1">
          {parsedContent.map((line, index) => {
            if (line.kind === "heading") {
              return (
                <h3
                  key={`${index}-${line.text}`}
                  className="mb-2 mt-5 border-b border-teal-700/30 pb-1 text-sm font-bold uppercase tracking-[0.12em] text-teal-800 first:mt-0"
                >
                  {line.text}
                </h3>
              );
            }

            if (line.kind === "bullet") {
              return (
                <p
                  key={`${index}-${line.text}`}
                  className="relative pl-5 text-sm leading-relaxed text-slate-700"
                >
                  <span aria-hidden="true" className="absolute left-1 text-teal-700">
                    •
                  </span>
                  {line.text}
                </p>
              );
            }

            return (
              <p
                key={`${index}-${line.text}`}
                className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${
                  line.kind === "entry"
                    ? "font-semibold text-slate-900"
                    : "text-slate-700"
                }`}
              >
                {line.text}
              </p>
            );
          })}
        </div>
      </article>
    </div>
  );
}
