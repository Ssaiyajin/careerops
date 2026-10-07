import { render, screen, within } from "@testing-library/react";
import ResumePreview from "../ResumePreview";

const resume = [
  "Alex Morgan",
  "alex@example.com | Berlin | linkedin.com/in/alex",
  "PROFESSIONAL SUMMARY",
  "Cloud engineer focused on reliable platforms.",
  "TECHNICAL SKILLS",
  "Python | AWS | Terraform",
  "PROFESSIONAL EXPERIENCE",
  "Platform Engineer | Example Co. | 2022-Present",
  "• Automated cloud deployments.",
  "EDUCATION",
  "BSc Computer Science | Example University",
].join("\n");

describe("ResumePreview", () => {
  it("renders a paper-style resume with contact, sections, entry hierarchy, and bullets", () => {
    render(<ResumePreview text={resume} />);

    const preview = screen.getByTestId("resume-preview");
    const paper = within(preview).getByRole("article");

    expect(within(paper).getByRole("heading", { name: "Alex Morgan", level: 2 }))
      .toBeInTheDocument();
    expect(within(paper).getByText("alex@example.com | Berlin | linkedin.com/in/alex"))
      .toBeInTheDocument();
    expect(within(paper).getByRole("heading", { name: "PROFESSIONAL SUMMARY", level: 3 }))
      .toBeInTheDocument();
    expect(within(paper).getByRole("heading", { name: "TECHNICAL SKILLS", level: 3 }))
      .toBeInTheDocument();
    expect(within(paper).getByText("Platform Engineer | Example Co. | 2022-Present"))
      .toHaveClass("font-semibold");
    expect(within(paper).getByText("Automated cloud deployments."))
      .toBeInTheDocument();
    expect(paper).toHaveClass("bg-white");
  });

  it("renders short or sectionless source text without dropping content", () => {
    render(<ResumePreview text={"Alex Morgan\nPython developer"} />);

    const paper = within(screen.getByTestId("resume-preview")).getByRole("article");
    expect(within(paper).getByRole("heading", { name: "Alex Morgan" })).toBeInTheDocument();
    expect(within(paper).getByText("Python developer")).toBeInTheDocument();
  });
});
