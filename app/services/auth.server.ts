import { Role } from "@prisma/client";
import { Authenticator, Authorizer } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { GitHubStrategy } from "remix-auth-github";
import invariant from "tiny-invariant";
import { login, PublicUser } from "~/models/user.server";
import { sessionStorage } from "~/services/session.server";
import { env } from "~/utils/environment";

let BASE_URL = env("BASE_URL");

export let authenticator = new Authenticator<PublicUser>(sessionStorage);

authenticator.use(
  new GitHubStrategy(
    {
      clientID: env("GITHUB_CLIENT_ID"),
      clientSecret: env("GITHUB_CLIENT_SECRET"),
      callbackURL: new URL("/auth/github/callback", BASE_URL).toString(),
    },
    async ({ profile }) => {
      return await login("github", {
        email: profile.emails[0].value,
        displayName: profile.displayName,
        avatar: profile.photos[0].value,
      });
    }
  )
);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email");
    let password = form.get("password");

    invariant(typeof email === "string", "email must be a string");
    invariant(typeof password === "string", "password must be a string");

    return await login("form", { email, password });
  })
);

export let adminAuthorizer = new Authorizer(authenticator, [
  async function isAdmin({ user }) {
    return user.role === Role.ADMIN;
  },
]);
