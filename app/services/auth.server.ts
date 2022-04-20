import type { User } from "@prisma/client";
import { Authenticator, AuthorizationError } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { sessionStorage } from "~/services/session.server";
import { env, isDevelopment } from "~/utils/environment";
import { db } from "~/services/db.server";
import { createHash } from "node:crypto";
import { createCookie } from "@remix-run/node";

const BASE_URL = env("BASE_URL");

export let returnToCookie = createCookie("returnTo", {
  path: "/auth",
  sameSite: "lax",
  secure: isDevelopment(),
});

export let auth = new Authenticator<User["id"]>(sessionStorage);

auth.use(
  new GitHubStrategy(
    {
      clientID: env("GITHUB_CLIENT_ID"),
      clientSecret: env("GITHUB_CLIENT_SECRET"),
      callbackURL: new URL("/auth/github/callback", BASE_URL).toString(),
    },
    async ({ profile }) => {
      if (!profile.emails) {
        throw new AuthorizationError(
          "The GitHub account has no email addresses."
        );
      }

      let email = profile.emails.at(0)?.value;
      if (!email) {
        throw new AuthorizationError("The GitHub account has no email address");
      }

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
