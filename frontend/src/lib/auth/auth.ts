export async function login(
  email: string,
  password: string
) {
  await new Promise((resolve) =>
    setTimeout(resolve, 1000)
  );

  if (
    email === "test@careerops.ai" &&
    password === "password123"
  ) {
    return {
      access_token: "dummy-token",
    };
  }

  return {
    error: "Invalid credentials",
  };
}

export async function register(
  email: string,
  password: string
) {
  await new Promise((resolve) =>
    setTimeout(resolve, 1000)
  );

  return {
    access_token: "dummy-token",
  };
}