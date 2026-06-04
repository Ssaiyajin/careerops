const API_BASE_URL = "http://localhost:8000";

export async function uploadResume(
  file: File,
  jobDescription: string
) {

  const formData = new FormData();

  formData.append("file", file);
  formData.append("job_description", jobDescription);

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/resume/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {

      const errorText = await response.text();

      console.error("BACKEND ERROR:", errorText);

      throw new Error("Upload failed");
    }

    return response.json();

  } catch (error) {

    console.error("FETCH FAILED:", error);

    throw error;
  }
}