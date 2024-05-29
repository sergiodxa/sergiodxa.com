import type { AppLoadContext, SessionStorage } from "@remix-run/cloudflare";
import type { User } from "./session.server";

import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { z } from "zod";

import { Tables, database } from "~/services/db.server";
import { GitHub } from "~/services/github.server";

export class Auth {
	protected authenticator: Authenticator<User>;
	protected sessionStorage: SessionStorage;

	public authenticate: Authenticator<User>["authenticate"];

	constructor(url: URL, context: AppLoadContext) {
		this.sessionStorage = createCookieSessionStorage({
			cookie: {
				name: "sdx:auth",
				path: "/",
				maxAge: 60 * 60 * 24 * 365, // 1 year
				httpOnly: true,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
				secrets: [context.env.COOKIE_SESSION_SECRET],
			},
		});

		this.authenticator = new Authenticator<User>(this.sessionStorage, {
			throwOnError: true,
			sessionKey: "token",
		});

		let db = database(context.db);
		let gh = new GitHub(context.env.GH_APP_ID, context.env.GH_APP_PEM);

		this.authenticator.use(
			new OAuth2Strategy(
				{
					clientId: context.env.GITHUB_CLIENT_ID,
					clientSecret: context.env.GITHUB_CLIENT_SECRET,
					redirectURI: new URL("/auth/github/callback", url),
					authorizationEndpoint: new URL(
						"https://github.com/login/oauth/authorize",
					),
					tokenEndpoint: new URL("https://github.com/login/oauth/access_token"),
					scopes: ["read:user", "user:email"],
				},
				async ({ tokens }) => {
					let response = await fetch("https://api.github.com/user", {
						headers: {
							Accept: "application/vnd.github.v3+json",
							Authorization: `token ${tokens.access_token}`,
							"User-Agent": "Remix Auth",
						},
					});

					let profile = await z
						.object({
							node_id: z.string(),
							email: z.string().email(),
							login: z.string(),
							name: z.string(),
							avatar_url: z.string().url(),
						})
						.promise()
						.parse(response.json());

					let connection = await db.query.connections.findFirst({
						with: {
							user: {
								columns: {
									createdAt: false,
									updatedAt: false,
								},
							},
						},
						where: and(
							eq(Tables.connections.providerName, "github"),
							eq(Tables.connections.providerId, profile.node_id),
						),
					});

					let user = connection?.user;

					if (user) {
						return {
							...user,
							githubId: profile.node_id,
							isSponsor: await gh.isSponsoringMe(profile.node_id),
						};
					}

					let result = await db
						.insert(Tables.users)
						.values({
							role: "guess",
							email: profile.email,
							avatar: z.string().url().parse(profile.avatar_url),
							username: profile.login,
							displayName: profile.name,
						})
						.returning()
						.onConflictDoNothing({ target: Tables.users.email });

					user = result.at(0);
					if (!user) throw new Error("User not found");

					await db.insert(Tables.connections).values({
						userId: user.id,
						providerName: "github",
						providerId: profile.node_id,
					});

					return {
						id: user.id,
						role: user.role,
						email: user.email,
						avatar: user.avatar,
						username: user.username,
						displayName: user.displayName,
						githubId: profile.node_id,
						isSponsor: await gh.isSponsoringMe(profile.node_id),
					};
				},
			),
			"github",
		);

		this.authenticate = this.authenticator.authenticate.bind(
			this.authenticator,
		);
	}

	public async clear(request: Request) {
		let session = await this.sessionStorage.getSession(
			request.headers.get("cookie"),
		);
		return this.sessionStorage.destroySession(session);
	}
}
