import type { IGitHubService } from "./gh";
import type { SessionStorage } from "@remix-run/cloudflare";
import type { TypedSessionStorage } from "remix-utils";
import type { Env } from "~/server/env";

import { createWorkersKVSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { createTypedSessionStorage } from "remix-utils";
import { z } from "zod";

const UserSchema = z.object({
	username: z.string(),
	displayName: z.string(),
	email: z.string().email().nullable(),
	avatar: z.string().url(),
	githubId: z.string().min(1),
	isSponsor: z.boolean(),
});

const SessionSchema = z.object({
	user: UserSchema.optional(),
	strategy: z.string().optional(),
	"oauth2:state": z.string().uuid().optional(),
	"auth:error": z.object({ message: z.string() }).optional(),
});

export type User = z.infer<typeof UserSchema>;

export type Session = z.infer<typeof SessionSchema>;

export interface IAuthService {
	readonly authenticator: Authenticator<User>;
	readonly sessionStorage: TypedSessionStorage<typeof SessionSchema>;
}

export class AuthService implements IAuthService {
	#sessionStorage: TypedSessionStorage<typeof SessionSchema>;
	#authenticator: Authenticator<User>;

	constructor(kv: KVNamespace, env: Env, hostname: string, gh: IGitHubService) {
		let sessionStorage = createWorkersKVSessionStorage({
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

		this.#sessionStorage = createTypedSessionStorage({
			sessionStorage,
			schema: SessionSchema,
		});

		this.#authenticator = new Authenticator<User>(
			this.#sessionStorage as SessionStorage,
			{
				throwOnError: true,
			}
		);

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
					return {
						displayName: profile._json.name,
						username: profile._json.login,
						email: profile._json.email ?? profile.emails?.at(0) ?? null,
						avatar: profile._json.avatar_url,
						githubId: profile._json.node_id,
						isSponsor: await gh.isSponsoringMe(profile._json.node_id),
					};
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
