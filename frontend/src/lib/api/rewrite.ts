import { API_BASE_URL } from "./index";

export async function uploadResume(file: File, jobDescription: string) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("job_description", jobDescription);

  const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("BACKEND ERROR:", errorText);
    throw new Error("Upload failed");
  }

  return response.json();
}

