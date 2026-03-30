import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/signin") || request.nextUrl.pathname.startsWith("/signup");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/manager") || request.nextUrl.pathname.startsWith("/tenants");

  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/manager/:path*",
    "/tenants/:path*",
    "/signin",
    "/signup",
  ],
};
