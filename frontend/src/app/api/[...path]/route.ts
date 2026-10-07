import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "careerops_session";
const AUTH_ROUTES = new Set(["auth/login", "auth/register"]);
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function sessionMaxAge(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { exp?: unknown };
    if (typeof claims.exp !== "number") return null;

    const maxAge = Math.floor(claims.exp - Date.now() / 1000);
    return maxAge > 0 ? maxAge : null;
  } catch {
    return null;
  }
}

function clearSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function csrfRejected(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) return false;

  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return (
    origin !== request.nextUrl.origin ||
    (fetchSite !== null && fetchSite !== "same-origin" && fetchSite !== "none")
  );
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  if (csrfRejected(request)) {
    return NextResponse.json({ detail: "Cross-origin request rejected" }, { status: 403 });
  }

  const { path } = await context.params;
  const apiPath = path.join("/");
  if (apiPath === "auth/logout" && request.method === "POST") {
    const response = new NextResponse(null, { status: 204 });
    clearSession(response);
    return response;
  }

  const isAuthRequest = AUTH_ROUTES.has(apiPath);
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!isAuthRequest && !session) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const backendUrlValue =
    request.nextUrl.hostname === "careerops-ten.vercel.app"
      ? "https://careerops-api-dev.onrender.com"
      : process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
  const backendUrl = new URL(backendUrlValue);
  const isPrivateComposeBackend =
    backendUrl.protocol === "http:" &&
    backendUrl.hostname === "backend" &&
    backendUrl.port === "8000" &&
    backendUrl.pathname === "/" &&
    backendUrl.search === "" &&
    backendUrl.hash === "" &&
    backendUrl.username === "" &&
    backendUrl.password === "";

  if (
    process.env.NODE_ENV === "production" &&
    backendUrl.protocol !== "https:" &&
    !isPrivateComposeBackend
  ) {
    return NextResponse.json(
      {
        detail:
          "Production backend URL must use HTTPS, except for the private Docker Compose backend.",
      },
      { status: 500 }
    );
  }

  const target = new URL(
    `/api/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
    backendUrl
  );
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  if (session) headers.set("Authorization", `Bearer ${session}`);

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: SAFE_METHODS.has(request.method) ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ detail: "Backend unavailable" }, { status: 502 });
  }

  if (isAuthRequest && upstream.ok) {
    const result = (await upstream.json()) as { access_token?: unknown };
    if (typeof result.access_token !== "string") {
      return NextResponse.json({ detail: "Invalid authentication response" }, { status: 502 });
    }

    const maxAge = sessionMaxAge(result.access_token);
    if (maxAge === null) {
      return NextResponse.json({ detail: "Invalid authentication session" }, { status: 502 });
    }

    const response = NextResponse.json({ authenticated: true }, { status: upstream.status });
    response.cookies.set(SESSION_COOKIE, result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return response;
  }

  const responseHeaders = new Headers();
  for (const header of ["content-type", "content-disposition", "retry-after"]) {
    const value = upstream.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  const response = new NextResponse(
    upstream.status === 204 ? null : upstream.body,
    { status: upstream.status, headers: responseHeaders }
  );
  if (upstream.status === 401 || (apiPath === "auth/account" && upstream.ok)) {
    clearSession(response);
  }
  return response;
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
