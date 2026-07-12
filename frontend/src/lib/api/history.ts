import { API_BASE_URL } from "./index";

export async function getHistory() {
  const response = await fetch(
    `${API_BASE_URL}/api/history`
  );

  return response.json();
}