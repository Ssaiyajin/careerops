"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { uploadResume } from "@/lib/api";
import { setResumeData } from "@/store/resumeStore";

import BackgroundEffects from "@/components/ui/BackgroundEffects";
import PageContainer from "@/components/ui/PageContainer";

export default function UploadPage() {
  const router = useRouter();

  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [model, setModel] = useState("mistral");
  const handleFileChange = async (
  event: React.ChangeEvent<HTMLInputElement>
    ) => {

      const file = event.target.files?.[0];

      if (!file) return;
      console.log("FILE SELECTED:", file.name);
      setFileName(file.name);

      setUploading(true);

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
        
        console.log("CALLING BACKEND...");
        // REAL backend upload
        console.log("Starting upload...");

        const data = await uploadResume(file, model)

        console.log("BACKEND RESPONSE:", data);

        setResumeData(data);

        // complete progress
        setProgress(100);

        setTimeout(() => {
          router.push("/results");
        }, 1000);
        
        event.target.value = "";

      } catch (error) {

        console.error("UPLOAD ERROR:", error);

        event.target.value = "";
        
        alert("Upload failed. Check browser console.");

        setUploading(false);
      }
    };

    
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      <BackgroundEffects />

      <PageContainer>
      <div className="flex flex-col items-center text-center">
        {/* Header */}
        <div className="text-center">

          <div className="mb-8  items-center justify-center rounded-full border border-green-400/30 bg-green-400/5 px-14 pt-3 pb-[14px] text-base text-green-300 backdrop-blur-sm">
            AI Resume Upload
          </div>

          <h1 className="text-6xl font-bold tracking-tight">
            Upload Resume
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Upload your resume and begin your AI-powered
            career analysis journey.
          </p>

        </div>

        {/* Upload Card */}
        <div
          className="
          mt-14
          w-full
          max-w-3xl
          rounded-3xl
          border
          border-green-400/20
          bg-white/5
          p-8
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
            h-72
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
  onChange={handleFileChange}
  className="text-white"
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
              <div className="mt-6 rounded-full bg-green-500/10 px-5 py-2 text-sm text-green-300 ">
                {fileName}
              </div>
            )}

          </label>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-8">

              <div className="mb-3 flex justify-between text-sm text-white/60">
                <span>Uploading Resume...</span>
                <span>{progress}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">

                <div
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-green-400
                    to-emerald-500
                    transition-all
                    duration-200
                  "
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>
          )}


          {/* MODEL SELECTOR */}
          <div className="mb-8 flex justify-center gap-4">

            <button
              type="button"
              onClick={() => setModel("mistral:latest")}
              className={`
                rounded-xl
                px-6
                py-3
                border
                transition-all
                ${
                  model === "mistral:latest"
                    ? "bg-cyan-500 text-black border-cyan-400"
                    : "bg-black/30 text-white border-white/20"
                }
              `}
            >
               Mistral (Smart)
            </button>

            <button
              type="button"
              onClick={() => setModel("phi3:mini")}
              className={`
                rounded-xl
                px-6
                py-3
                border
                transition-all
                ${
                  model === "phi3:mini"
                    ? "bg-green-500 text-black border-green-400"
                    : "bg-black/30 text-white border-white/20"
                }
              `}
            >
              Phi-3 Mini (Fast)
            </button>

          </div>

        </div>
      </div>
      </PageContainer>

    </main>
  );
}