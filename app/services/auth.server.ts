import type { User } from "~/models/user.server";
import { Authenticator, AuthorizationError } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { env, isProduction, isDevelopment } from "~/utils/environment";
import { createHash } from "node:crypto";
import { createCookie, createCookieSessionStorage } from "@remix-run/node";

const BASE_URL = env("BASE_URL");

let sessionCookie = createCookie("session", {
  path: "/",
  secure: isProduction(),
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  sameSite: "lax",
  secrets: [env("SESSION_SECRET", "s3cr3t")],
});

export let returnToCookie = createCookie("returnTo", {
  path: "/auth",
  sameSite: "lax",
  secure: isDevelopment(),
});

export let sessionStorage = createCookieSessionStorage({
  cookie: sessionCookie,
});

export let { commitSession, destroySession } = sessionStorage;

export function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export let auth = new Authenticator<User["id"]>(sessionStorage);

auth.use(
  new GitHubStrategy(
    {
      clientID: env("GITHUB_CLIENT_ID"),
      clientSecret: env("GITHUB_CLIENT_SECRET"),
      callbackURL: new URL("/auth/github/callback", BASE_URL).toString(),
    },
    async ({ profile, context }) => {
      if (!profile.emails) {
        throw new AuthorizationError(
          "The GitHub account has no email addresses."
        );
      }

      let email = profile.emails.at(0)?.value;
      if (!email) {
        throw new AuthorizationError("The GitHub account has no email address");
      }

      let { db } = context as SDX.Context;

      let provider = await db.provider.findFirst({
        select: { userId: true },
        where: { provider: "github", providerId: profile.id },
      });

      if (!provider) {
        let avatar = profile.photos.at(0)?.value ?? gravatar(email);

        provider = await db.provider.create({
          select: { userId: true },
          data: {
            provider: "github",
            providerId: profile.id,
            user: {
              create: {
                email,
                displayName: profile.displayName,
                avatar,
              },
            },
          },
        });
      }

      return provider.userId;
    }
  )
);

function gravatar(email: string): string {
  let hash = createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  return new URL(hash, "https://www.gravatar.com/avatar/").toString();
}
