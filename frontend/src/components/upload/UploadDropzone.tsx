type Props = {
  fileName: string;
  onFileChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

export default function UploadDropzone({
  fileName,
  onFileChange,
}: Props) {
  return (
    <label
      className="
        flex
        h-64
        cursor-pointer
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-green-400/40
        bg-black/30
        transition
        hover:border-green-400
        hover:bg-black/50
      "
    >
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={onFileChange}
      />

      {/* ICON */}
      <div className="rounded-full bg-green-500/10 p-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="h-10 w-10 text-green-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0l-4 4m4-4l4 4M4 16.5v1.125C4 18.936 5.064 20 6.375 20h11.25C18.936 20 20 18.936 20 17.625V16.5"
          />
        </svg>
      </div>

      <p className="mt-6 text-lg font-medium">
        Click or Drag & Drop Resume
      </p>

      <p className="mt-2 text-sm text-white/50">
        PDF only
      </p>

      {fileName && (
        <div className="mt-6 rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-300">
          {fileName}
        </div>
      )}
    </label>
  );
}