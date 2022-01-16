import { Role } from "@prisma/client";
import { SessionStorage } from "remix";
import {
  AuthenticateOptions,
  Authenticator,
  Authorizer,
  Strategy,
} from "remix-auth";
import { EmailLinkStrategy } from "remix-auth-email-link";
import { FormStrategy } from "remix-auth-form";
import { GitHubStrategy } from "remix-auth-github";
import invariant from "tiny-invariant";
import { login, PublicUser } from "~/models/user.server";
import { sessionStorage } from "~/services/session.server";
import { env } from "~/utils/environment";
import { sendEmail } from "./email.server";

let BASE_URL = env("BASE_URL");

export let authenticator = new Authenticator<PublicUser>(sessionStorage);

class TokenStrategy<User> extends Strategy<User, { token: string }> {
  name = "token";

  async authenticate(
    request: Request,
    sessionStorage: SessionStorage,
    options: AuthenticateOptions
  ): Promise<User> {
    let token = request.headers.get("Authorization");

    if (!token) {
      return await this.failure(
        "Missing token",
        request,
        sessionStorage,
        options
      );
    }

    let user;
    try {
      user = await this.verify({ token });
      return await this.success(user, request, sessionStorage, options);
    } catch (error) {
      return await this.failure(
        (error as Error).message,
        request,
        sessionStorage,
        options
      );
    }
  }
}

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

authenticator.use(
  new EmailLinkStrategy(
    { sendEmail, secret: env("MAGIC_LINK_SECRET") },
    async ({ email }) => {
      return await login("email", { email });
    }
  )
);

authenticator.use(
  new TokenStrategy(async ({ token }) => {
    return await login("email", { email: token });
  })
);

export let adminAuthorizer = new Authorizer(authenticator, [
  async function isAdmin({ user }) {
    return user.role === Role.ADMIN;
  },
]);
