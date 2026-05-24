const API_BASE_URL = "http://127.0.0.1:8000";

export async function uploadResume(file: File) {

  console.log("UPLOAD FUNCTION STARTED");

  const formData = new FormData();

  formData.append("file", file);

  console.log("FORM DATA CREATED");

  try {

    const response = await fetch(
      `${API_BASE_URL}/api/resume/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    console.log("RAW RESPONSE:", response);

    const data = await response.json();

    console.log("PARSED DATA:", data);

    return data;

  } catch (error) {

    console.error("FETCH FAILED:", error);

    throw error;
  }
}