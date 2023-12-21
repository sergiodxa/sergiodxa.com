import type { User } from "./session.server";
import type { AppLoadContext, SessionStorage } from "@remix-run/cloudflare";

import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";

import { Database, Tables } from "~/services/db.server";
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

		let db = Database(context.db);
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
						with: { user: true },
						where: and(
							eq(Tables.connections.providerName, "github"),
							eq(Tables.connections.providerId, profile._json.node_id),
						),
					});

					let user = connection?.user;

					if (user) {
						return {
							displayName: user.displayName,
							email: user.email,
							githubId: profile._json.node_id,
							isSponsor: await gh.isSponsoringMe(profile._json.node_id),
						};
					}

					let result = await db
						.insert(Tables.users)
						.values({
							displayName: profile._json.name,
							email: profile._json.email,
							role: "user",
						})
						.returning()
						.onConflictDoNothing({ target: Tables.users.email });

					await db.insert(Tables.connections).values({
						userId: result.at(0)!.id,
						providerName: "github",
						providerId: profile._json.node_id,
					});

					return {
						displayName: result.at(0)!.displayName,
						email: result.at(0)!.email,
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
