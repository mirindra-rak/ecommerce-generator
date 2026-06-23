import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_SEGMENTS = ["/compte", "/account"];

const SESSION_COOKIE = "better-auth.session_token";
const SECURE_SESSION_COOKIE = "__Secure-better-auth.session_token";

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.has(SESSION_COOKIE) || request.cookies.has(SECURE_SESSION_COOKIE);
}

function isProtectedPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  const pathWithoutLocale =
    segments.length > 0 && routing.locales.includes(segments[0] as "fr" | "en")
      ? "/" + segments.slice(1).join("/")
      : pathname;

  return PROTECTED_SEGMENTS.some(
    (seg) => pathWithoutLocale === seg || pathWithoutLocale.startsWith(seg + "/"),
  );
}

export default function middleware(request: NextRequest) {
  if (isProtectedPath(request.nextUrl.pathname) && !hasSessionCookie(request)) {
    const locale = request.nextUrl.pathname.split("/").filter(Boolean)[0] || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/connexion`, request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
