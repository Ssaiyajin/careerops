/** @jest-environment node */

import { NextRequest } from "next/server";
import { GET, POST } from "./route";

const context = (path: string[]) => ({ params: Promise.resolve({ path }) });
const token = `header.${Buffer.from(
  JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 600 })
).toString("base64url")}.signature`;

const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.BACKEND_API_URL = "http://127.0.0.1:8000";
  global.fetch = fetchMock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("stores login token only in an HttpOnly session cookie", async () => {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ access_token: token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );
  const request = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      Origin: "http://localhost:3000",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: "user@example.com", password: "secret" }),
  });

  const response = await POST(request, context(["auth", "login"]));

  expect(await response.json()).toEqual({ authenticated: true });
  expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  expect(response.headers.get("set-cookie")).toContain("SameSite=Lax");
});

test("rejects cross-origin mutation requests", async () => {
  const request = new NextRequest("http://localhost:3000/api/export-resume", {
    method: "POST",
    headers: {
      Origin: "https://attacker.example",
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  const response = await POST(request, context(["export-resume"]));

  expect(response.status).toBe(403);
  expect(fetchMock).not.toHaveBeenCalled();
});

test("logout expires the HttpOnly session cookie", async () => {
  const request = new NextRequest("http://localhost:3000/api/auth/logout", {
    method: "POST",
    headers: { Origin: "http://localhost:3000" },
  });

  const response = await POST(request, context(["auth", "logout"]));

  expect(response.status).toBe(204);
  expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  expect(fetchMock).not.toHaveBeenCalled();
});

test("forwards the session as an Authorization header only server-side", async () => {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );
  const request = new NextRequest("http://localhost:3000/api/history", {
    headers: { Cookie: `careerops_session=${token}` },
  });

  const response = await GET(request, context(["history"]));
  const [, init] = fetchMock.mock.calls[0];
  const headers = new Headers(init?.headers);

  expect(response.status).toBe(200);
  expect(headers.get("Authorization")).toBe(`Bearer ${token}`);
});
