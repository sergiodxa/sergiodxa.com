import type { TypedSessionStorage } from "remix-utils/typed-session";

import { createWorkersKVSessionStorage, redirect } from "@remix-run/cloudflare";
import { createTypedSessionStorage } from "remix-utils/typed-session";
import { z } from "zod";

interface Services {
	kv: KVNamespace;
}

export const UserSchema = z.object({
	username: z.string(),
	displayName: z.string(),
	email: z.string().email().nullable(),
	avatar: z.string().url(),
	githubId: z.string().min(1),
	isSponsor: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;

export const SessionSchema = z.object({
	user: UserSchema.optional(),
});

export class SessionStorage {
	protected sessionStorage: TypedSessionStorage<typeof SessionSchema>;

	public read: TypedSessionStorage<typeof SessionSchema>["getSession"];
	public commit: TypedSessionStorage<typeof SessionSchema>["commitSession"];
	public destroy: TypedSessionStorage<typeof SessionSchema>["destroySession"];

	constructor(services: Services, secret = "s3cr3t") {
		this.sessionStorage = createTypedSessionStorage({
			sessionStorage: createWorkersKVSessionStorage({
				kv: services.kv,
				cookie: {
					name: "sdx:session",
					path: "/",
					maxAge: 60 * 60 * 24 * 365, // 1 year
					httpOnly: true,
					sameSite: "lax",
					secure: process.env.NODE_ENV === "production",
					secrets: [secret],
				},
			}),
			schema: SessionSchema,
		});

		this.read = this.sessionStorage.getSession;
		this.commit = this.sessionStorage.commitSession;
		this.destroy = this.sessionStorage.destroySession;
	}

	static async logout(services: Services, request: Request, secret = "s3cr3t") {
		let sessionStorage = new SessionStorage(services, secret);
		let session = await sessionStorage.read(request.headers.get("cookie"));
		throw redirect("/", {
			headers: { "set-cookie": await sessionStorage.destroy(session) },
		});
	}

	static async readUser(
		services: Services,
		request: Request,
		secret = "s3cr3t",
	) {
		let sessionStorage = new SessionStorage(services, secret);
		let session = await sessionStorage.read(request.headers.get("cookie"));
		return session.get("user");
	}

	static async requireUser(
		services: Services,
		request: Request,
		secret = "s3cr3t",
	) {
		let maybeUser = await this.readUser(services, request, secret);
		if (!maybeUser) throw redirect("/auth/login");
		return maybeUser;
	}
}
