import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl/middleware", () => ({
  default: () => {
    const fn = vi.fn(() => new Response(null, { status: 200 }));
    return fn;
  },
}));

vi.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["fr", "en"],
    defaultLocale: "fr",
    localePrefix: "always",
  },
}));

import middleware from "./middleware";

function makeRequest(pathname: string, cookies: Record<string, string> = {}) {
  const url = new URL(pathname, "http://localhost:3000");
  const cookieEntries = new Map(
    Object.entries(cookies).map(([k, v]) => [k, { name: k, value: v }]),
  );
  return {
    nextUrl: url,
    url: url.toString(),
    cookies: {
      has: (name: string) => cookieEntries.has(name),
      get: (name: string) => cookieEntries.get(name),
    },
  } as Parameters<typeof middleware>[0];
}

describe("middleware auth guard", () => {
  it("redirects anonymous user from /fr/compte to /fr/connexion", () => {
    const response = middleware(makeRequest("/fr/compte"));
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/fr/connexion");
    expect(location.searchParams.get("redirect")).toBe("/fr/compte");
  });

  it("redirects anonymous user from /en/account to /en/connexion", () => {
    const response = middleware(makeRequest("/en/account"));
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/en/connexion");
    expect(location.searchParams.get("redirect")).toBe("/en/account");
  });

  it("redirects anonymous from /fr/compte/profil (sub-route)", () => {
    const response = middleware(makeRequest("/fr/compte/profil"));
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/fr/connexion");
  });

  it("allows authenticated user on /fr/compte", () => {
    const response = middleware(
      makeRequest("/fr/compte", { "better-auth.session_token": "abc123" }),
    );
    expect(response.status).toBe(200);
  });

  it("allows authenticated user with secure cookie on /fr/compte", () => {
    const response = middleware(
      makeRequest("/fr/compte", {
        "__Secure-better-auth.session_token": "abc123",
      }),
    );
    expect(response.status).toBe(200);
  });

  it("does not redirect on public routes", () => {
    const response = middleware(makeRequest("/fr/produit/doliprane"));
    expect(response.status).toBe(200);
  });

  it("does not redirect on root", () => {
    const response = middleware(makeRequest("/fr"));
    expect(response.status).toBe(200);
  });
});
