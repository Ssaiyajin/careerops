import UploadDropzone from "./UploadDropzone";
import JobDescriptionInput from "./JobDescriptionInput";
import AnalyzeButton from "./AnalyzeButton";

type Props = {
  fileName: string;
  onFileChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
};

export default function UploadCard({
  fileName,
  onFileChange,
  jobDescription,
  setJobDescription,
}: Props) {
  return (
    <div className="mt-12 w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

      <UploadDropzone
        fileName={fileName}
        onFileChange={onFileChange}
      />

      <JobDescriptionInput
        value={jobDescription}
        onChange={setJobDescription}
      />

      <AnalyzeButton />

    </div>
  );
}