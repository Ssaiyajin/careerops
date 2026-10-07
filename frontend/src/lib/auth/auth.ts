export type AuthResponse = {
  error?: string;
  authenticated?: boolean;
  [key: string]: unknown;
};

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  }

  return fallback;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "same-origin",
    });

    let data: unknown = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      return { error: getErrorMessage(data, "Incorrect email or password") };
    }

    return data as AuthResponse;
  } catch {
    return { error: "Unable to reach the server. Please check your connection and try again." };
  }
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "same-origin",
    });

    let data: unknown = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      return { error: getErrorMessage(data, "Registration failed") };
    }

    return data as AuthResponse;
  } catch {
    return { error: "Unable to reach the server. Please check your connection and try again." };
  }
}

export async function deleteAccount() {
  const response = await fetch("/api/auth/account", {
    method: "DELETE",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(getErrorMessage(data, "Account deletion failed"));
  }
}
