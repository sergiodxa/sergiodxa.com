import type { Env } from "../env";
import type { SessionStorage } from "@remix-run/cloudflare";

import { createCloudflareKVSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { z } from "zod";

const UserSchema = z.object({
	username: z.string(),
	displayName: z.string(),
	email: z.string().email(),
	avatar: z.string().url(),
	githubId: z.string().min(1),
});

export type User = z.infer<typeof UserSchema>;

export interface IAuthService {
	readonly authenticator: Authenticator<User>;
	readonly sessionStorage: SessionStorage;
}

export class AuthService implements IAuthService {
	#sessionStorage: SessionStorage;
	#authenticator: Authenticator<User>;

	constructor(kv: KVNamespace, env: Env, hostname: string) {
		this.#sessionStorage = createCloudflareKVSessionStorage({
			cookie: {
				name: "sid",
				httpOnly: true,
				secure: env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				secrets: [env.COOKIE_SESSION_SECRET],
			},
			kv,
		});

		this.#authenticator = new Authenticator<User>(this.#sessionStorage, {
			throwOnError: true,
		});

		let callbackURL = new URL(env.GITHUB_CALLBACK_URL);
		callbackURL.hostname = hostname;

		this.#authenticator.use(
			new GitHubStrategy(
				{
					clientID: env.GITHUB_CLIENT_ID,
					clientSecret: env.GITHUB_CLIENT_SECRET,
					callbackURL: callbackURL.toString(),
				},
				async ({ profile }) => {
					return UserSchema.parse({
						displayName: profile._json.name,
						username: profile._json.login,
						email: profile._json.email,
						avatar: profile._json.avatar_url,
						githubId: profile._json.node_id,
					});
				}
			)
		);
	}

	get authenticator() {
		return this.#authenticator;
	}

	get sessionStorage() {
		return this.#sessionStorage;
	}
}
