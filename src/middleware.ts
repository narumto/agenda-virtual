import { NextRequest, NextResponse } from "next/server";
import { verifyProToken, COOKIE_NAME } from "@/backend/lib/proJwt";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login" || pathname === "/profissional/login") {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const session = await verifyProToken(token);
      if (session) {
        return NextResponse.redirect(new URL("/painel", req.nextUrl.origin));
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/painel") || pathname.startsWith("/profissional")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/profissional/login", req.nextUrl.origin));
    }

    const session = await verifyProToken(token);
    if (!session) {
      const res = NextResponse.redirect(new URL("/profissional/login", req.nextUrl.origin));
      res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
      return res;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profissional/:path*", "/painel/:path*", "/login"],
};
