import type { AppLoadContext, SessionStorage } from "@remix-run/cloudflare";
import type { User } from "./session.server";

import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { z } from "zod";

import { Tables, database } from "~/services/db.server";
import { GitHub } from "~/services/github.server";

export class Auth {
	protected authenticator: Authenticator<User>;
	protected sessionStorage: SessionStorage;

	public authenticate: Authenticator<User>["authenticate"];

	constructor(context: AppLoadContext) {
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
			new GitHubStrategy(
				{
					clientID: context.env.GITHUB_CLIENT_ID,
					clientSecret: context.env.GITHUB_CLIENT_SECRET,
					callbackURL: "/auth/github/callback",
				},
				async ({ profile }) => {
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
							eq(Tables.connections.providerId, profile._json.node_id),
						),
					});

					let user = connection?.user;

					if (user) {
						return {
							...user,
							githubId: profile._json.node_id,
							isSponsor: await gh.isSponsoringMe(profile._json.node_id),
						};
					}

					let result = await db
						.insert(Tables.users)
						.values({
							role: "guess",
							email: profile._json.email,
							avatar: z.string().url().parse(profile._json.avatar_url),
							username: profile._json.login,
							displayName: profile._json.name,
						})
						.returning()
						.onConflictDoNothing({ target: Tables.users.email });

					user = result.at(0);
					if (!user) throw new Error("User not found");

					await db.insert(Tables.connections).values({
						userId: user.id,
						providerName: "github",
						providerId: profile._json.node_id,
					});

					return {
						id: user.id,
						role: user.role,
						email: user.email,
						avatar: user.avatar,
						username: user.username,
						displayName: user.displayName,
						githubId: profile._json.node_id,
						isSponsor: await gh.isSponsoringMe(profile._json.node_id),
					};
				},
			),
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
