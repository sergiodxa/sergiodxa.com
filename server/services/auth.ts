import type { Env } from "../env";
import type { SessionStorage } from "@remix-run/cloudflare";
import type { GitHubProfile } from "remix-auth-github";

import { createCloudflareKVSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";

export interface IAuthService {
	readonly authenticator: Authenticator<GitHubProfile>;
}

export class AuthService implements IAuthService {
	#sessionStorage: SessionStorage;
	#authenticator: Authenticator<GitHubProfile>;

	constructor(kv: KVNamespace, env: Env) {
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

		this.#authenticator = new Authenticator<GitHubProfile>(
			this.#sessionStorage,
			{
				throwOnError: true,
			}
		);

		this.#authenticator.use(
			new GitHubStrategy(
				{
					clientID: env.GITHUB_CLIENT_ID,
					clientSecret: env.GITHUB_CLIENT_SECRET,
					callbackURL: env.GITHUB_CALLBACK_URL,
				},
				async ({ profile }) => {
					return profile;
				}
			)
		);
	}

	get authenticator() {
		return this.#authenticator;
	}
}
