import { uploadResume } from "@/lib/api/rewrite";

describe("rewrite API helper", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("submits a resume file and returns JSON on success", async () => {
    const fakeResponse = { message: "ok" };
    const json = jest.fn().mockResolvedValue(fakeResponse);
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json });

    const file = new File(["dummy"], "resume.pdf", { type: "application/pdf" });
    const result = await uploadResume(file, "Job desc");

    expect(global.fetch).toHaveBeenCalled();
    expect(result).toEqual(fakeResponse);
  });

  it("surfaces the backend's upload error detail", async () => {
    const json = jest.fn().mockResolvedValue({
      detail: "Failed to process resume. Please try again.",
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json,
    });

    const file = new File(["dummy"], "resume.pdf", { type: "application/pdf" });
    await expect(uploadResume(file, "Job desc")).rejects.toThrow(
      "Failed to process resume. Please try again."
    );
  });

  it("includes the HTTP status when the upload response has no detail", async () => {
    const json = jest.fn().mockRejectedValue(new Error("Invalid JSON"));
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      json,
    });

    const file = new File(["dummy"], "resume.pdf", { type: "application/pdf" });
    await expect(uploadResume(file, "Job desc")).rejects.toThrow(
      "Resume upload failed (HTTP 502)."
    );
  });
});
