import type { User } from "./session.server";
import type { GitHub } from "../services/github.server";
import type { SessionStorage } from "@remix-run/cloudflare";

import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";

interface Services {
	gh: GitHub;
}

export class Auth {
	protected authenticator: Authenticator<User>;
	protected sessionStorage: SessionStorage;

	public authenticate: Authenticator<User>["authenticate"];

	constructor(
		services: Services,
		clientID: string,
		clientSecret: string,
		sessionSecret = "s3cr3t",
	) {
		this.sessionStorage = createCookieSessionStorage({
			cookie: {
				name: "sdx:auth",
				path: "/",
				maxAge: 60 * 60 * 24 * 365, // 1 year
				httpOnly: true,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
				secrets: [sessionSecret],
			},
		});

		this.authenticator = new Authenticator<User>(this.sessionStorage, {
			throwOnError: true,
			sessionKey: "token",
		});

		this.authenticator.use(
			new GitHubStrategy(
				{
					clientID,
					clientSecret,
					callbackURL: "/auth/github/callback",
				},
				async ({ profile }) => {
					return {
						displayName: profile._json.name,
						username: profile._json.login,
						email: profile._json.email ?? profile.emails?.at(0) ?? null,
						avatar: profile._json.avatar_url,
						githubId: profile._json.node_id,
						isSponsor: await services.gh.isSponsoringMe(profile._json.node_id),
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
