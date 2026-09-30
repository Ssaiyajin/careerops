import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("careerops_session");

  const protectedRoutes = [
    "/dashboard",
    "/upload",
    "/results",
    "/history",
  ];

  const isProtected = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/results/:path*",
    "/history/:path*",
  ],
};