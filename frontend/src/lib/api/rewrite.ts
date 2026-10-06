import { API_BASE_URL } from "./index";

export async function uploadResume(file: File, jobDescription: string) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("job_description", jobDescription);

  const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });

  if (!response.ok) {
    const fallbackMessage = `Resume upload failed (HTTP ${response.status}).`;
    let detail: unknown;

    try {
      const result: unknown = await response.json();
      if (result && typeof result === "object" && "detail" in result) {
        detail = result.detail;
      }
    } catch {
      detail = undefined;
    }

    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail
              .map((item) =>
                item && typeof item === "object" && "msg" in item
                  ? String(item.msg)
                  : ""
              )
              .filter(Boolean)
              .join("; ") || fallbackMessage
          : fallbackMessage;

    throw new Error(message);
  }

  return response.json();
}
