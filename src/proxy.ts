import { NextRequest, NextResponse } from "next/server";
import { verifyProToken, COOKIE_NAME } from "@/backend/lib/proJwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/profissional")) {
    return NextResponse.next();
  }

  if (pathname === "/profissional/login") {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const session = await verifyProToken(token);
      if (session) {
        return NextResponse.redirect(new URL("/profissional/dashboard", req.url));
      }
    }
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/profissional/login", req.url));
  }

  const session = await verifyProToken(token);
  if (!session) {
    const res = NextResponse.redirect(new URL("/profissional/login", req.url));
    res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profissional/:path*"],
};
