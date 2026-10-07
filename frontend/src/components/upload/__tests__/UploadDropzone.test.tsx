import { render, screen, fireEvent } from "@testing-library/react";
import UploadDropzone from "@/components/upload/UploadDropzone";

describe("UploadDropzone", () => {
  it("renders dropzone and file name when provided", () => {
    const onFileChange = jest.fn();

    const { rerender } = render(
      <UploadDropzone fileName="resume.pdf" onFileChange={onFileChange} />
    );

    expect(screen.getByText(/Click or Drag & Drop Resume/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF only/i)).toBeInTheDocument();
    expect(screen.getByText("resume.pdf")).toBeInTheDocument();

    rerender(<UploadDropzone fileName="" onFileChange={onFileChange} />);
    expect(screen.queryByText("resume.pdf")).not.toBeInTheDocument();
  });

  it("triggers onFileChange when file input changes", () => {
    const onFileChange = jest.fn();
    render(<UploadDropzone fileName="" onFileChange={onFileChange} />);

    const input = screen.getByTestId("upload-file-input") as HTMLInputElement;
    const file = new File(["dummy pdf data"], "resume.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file] } });
    expect(onFileChange).toHaveBeenCalled();
  });
});
