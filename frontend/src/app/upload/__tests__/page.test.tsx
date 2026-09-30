import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UploadPage from "@/app/upload/page";
import ResultsPage from "@/app/results/page";

const mockPush = jest.fn();
const mockUploadResume = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush })
}));

jest.mock("@/lib/api/rewrite", () => ({
  uploadResume: (file: File, jobDescription: string) => mockUploadResume(file, jobDescription)
}));

jest.mock("@/lib/auth/auth-guard", () => ({
  useAuthGuard: jest.fn()
}));

describe("UploadPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders upload page text", () => {
    render(<UploadPage />);

    expect(screen.getByRole("heading", { name: /Upload Resume/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste LinkedIn or company job description/i)).toBeInTheDocument();
  });

  it("calls uploadResume and navigates on valid file upload", async () => {
    mockUploadResume.mockResolvedValue({
      skills: ["Python"],
      candidate_name: "Test User",
      ats: { ats_score: 85, recommendations: [] },
      experience_level: "Senior",
      entities: { names: [], organizations: [], locations: [], dates: [], emails: [], phones: [] },
      text_preview: "Sample resume",
      job_match: { match_score: 72, matched_skills: ["Python"], missing_skills: [] }
    });

    const { unmount } = render(<UploadPage />);
    fireEvent.click(screen.getByRole("checkbox"));

    const file = new File(["dummy pdf content"], "test.pdf", {
      type: "application/pdf"
    });

    const input = screen.getByTestId("upload-file-input") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(
      () => {
        expect(mockUploadResume).toHaveBeenCalled();
        const [calledFile, calledDescription] = mockUploadResume.mock.calls[0];
        expect(calledFile).toBeInstanceOf(File);
        expect((calledFile as File).name).toBe("test.pdf");
        expect(calledDescription).toBe("");
      },
      { timeout: 5000 }
    );

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/results");
      },
      { timeout: 5000 }
    );

    unmount();
    render(<ResultsPage />);
    expect(await screen.findByRole("heading", { name: "Test User" })).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("updates job description", () => {
    render(<UploadPage />);

    const textarea = screen.getByPlaceholderText(/Paste LinkedIn or company job description/i);
    fireEvent.change(textarea, { target: { value: "This is a job description" } });

    expect((textarea as HTMLTextAreaElement).value).toBe("This is a job description");
  });
});
