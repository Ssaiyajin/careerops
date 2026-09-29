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

  it("throws when the upload fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const text = jest.fn().mockResolvedValue("bad request");
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, text });

    const file = new File(["dummy"], "resume.pdf", { type: "application/pdf" });
    await expect(uploadResume(file, "Job desc")).rejects.toThrow("Upload failed");

    consoleError.mockRestore();
  });
});
