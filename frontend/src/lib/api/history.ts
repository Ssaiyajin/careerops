import { API_BASE_URL } from "./index";
import { getToken } from "@/lib/auth/token";

export async function getHistory() {
  const response = await fetch(`${API_BASE_URL}/api/history`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load history");
  }

  return response.json();
}
