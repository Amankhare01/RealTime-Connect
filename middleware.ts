import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("jwt");

  if (!token && req.nextUrl.pathname.startsWith("/chat")) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }
}

export const config = {
  matcher: ["/chat/:path*", "/api/messages/:path*", "/api/users/:path*"],
};
