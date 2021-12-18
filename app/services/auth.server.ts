import { Role, User } from "@prisma/client";
import { Authenticator, Authorizer, GitHubStrategy } from "remix-auth";
import { db } from "~/services/db.server";
import { sessionStorage } from "~/services/session.server";
import { env } from "~/utils/environment";

let BASE_URL = env("BASE_URL");

let gitHubStrategy = new GitHubStrategy<User>(
  {
    clientID: env("GITHUB_CLIENT_ID"),
    clientSecret: env("GITHUB_CLIENT_SECRET"),
    callbackURL: new URL("/auth/github/callback", BASE_URL).toString(),
  },
  async (_, __, ___, profile) => {
    return await db.user.upsert({
      where: { email: profile.emails[0].value },
      update: {
        displayName: profile.displayName,
        avatar: profile.photos[0].value,
      },
      create: {
        email: profile.emails[0].value,
        displayName: profile.displayName,
        avatar: profile.photos[0].value,
      },
    });
  }
);

export let authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(gitHubStrategy);

export let adminAuthorizer = new Authorizer(authenticator, [
  async function isAdmin({ user }) {
    return user.role === Role.ADMIN;
  },
]);
