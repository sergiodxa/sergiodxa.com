import { createHash } from "node:crypto";

import { type User } from "@prisma/client";
import { createCookie, createCookieSessionStorage } from "@remix-run/node";
import { Authenticator, AuthorizationError } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";

import {
	BASE_URL,
	COOKIE_SESSION_SECRET,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	NODE_ENV,
} from "~/env";

let sessionCookie = createCookie("session", {
	path: "/",
	secure: NODE_ENV === "production",
	httpOnly: true,
	maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
	sameSite: "lax",
	secrets: [COOKIE_SESSION_SECRET],
});

export let returnToCookie = createCookie("returnTo", {
	path: "/auth",
	sameSite: "lax",
	secure: NODE_ENV === "production",
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
			clientID: GITHUB_CLIENT_ID,
			clientSecret: GITHUB_CLIENT_SECRET,
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
