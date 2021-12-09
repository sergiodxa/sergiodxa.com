import { createCookieSessionStorage } from "@remix-run/server-runtime";
import { requireEnv } from "~/utils/environment";

export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "session",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
    secrets: [requireEnv("SESSION_SECRET", "s3cr3t")],
  },
});

export let { commitSession, destroySession } = sessionStorage;

export function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}
