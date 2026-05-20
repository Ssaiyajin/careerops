type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function JobDescriptionInput({
  value,
  onChange,
}: Props) {
  return (
    <div className="mt-10">

      <label className="mb-3 block text-sm text-white/70">
        Job Description
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste job description here..."
        className="
          h-44
          w-full
          rounded-2xl
          border
          border-white/10
          bg-black/40
          p-5
          text-white
          outline-none
          transition
          focus:border-green-400
        "
      />

    </div>
  );
}