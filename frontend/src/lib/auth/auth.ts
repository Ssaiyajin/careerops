export async function login(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "same-origin",
  });

  const data = await response.json();

  if (!response.ok) {
    return { error: data.detail || "Login failed" };
  }

  return data;
}

export async function register(email: string, password: string) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "same-origin",
  });

  const data = await response.json();

  if (!response.ok) {
    return { error: data.detail || "Registration failed" };
  }

  return data;
}

export async function deleteAccount() {
  const response = await fetch("/api/auth/account", {
    method: "DELETE",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "Account deletion failed");
  }
}
