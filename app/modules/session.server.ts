import type { AppLoadContext } from "@remix-run/cloudflare";
import type { TypedSessionStorage } from "remix-utils/typed-session";

import { createWorkersKVSessionStorage, redirect } from "@remix-run/cloudflare";
import { createTypedSessionStorage } from "remix-utils/typed-session";
import { z } from "zod";

export const UserSchema = z.object({
	id: z.string().uuid(),
	role: z.enum(["admin", "user"]),
	displayName: z.string(),
	email: z.string().email().nullable(),
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

	constructor(context: AppLoadContext) {
		this.sessionStorage = createTypedSessionStorage({
			sessionStorage: createWorkersKVSessionStorage({
				kv: context.kv.auth,
				cookie: {
					name: "sdx:session",
					path: "/",
					maxAge: 60 * 60 * 24 * 365, // 1 year
					httpOnly: true,
					sameSite: "lax",
					secure: process.env.NODE_ENV === "production",
					secrets: [context.env.COOKIE_SESSION_SECRET ?? "s3cr3t"],
				},
			}),
			schema: SessionSchema,
		});

		this.read = this.sessionStorage.getSession;
		this.commit = this.sessionStorage.commitSession;
		this.destroy = this.sessionStorage.destroySession;
	}

	static async logout(context: AppLoadContext, request: Request) {
		let sessionStorage = new SessionStorage(context);
		let session = await sessionStorage.read(request.headers.get("cookie"));
		throw redirect("/", {
			headers: { "set-cookie": await sessionStorage.destroy(session) },
		});
	}

	static async readUser(context: AppLoadContext, request: Request) {
		let sessionStorage = new SessionStorage(context);
		let session = await sessionStorage.read(request.headers.get("cookie"));
		return session.get("user");
	}

	static async requireUser(
		context: AppLoadContext,
		request: Request,
		returnTo = "/auth/login",
	) {
		let maybeUser = await this.readUser(context, request);
		if (!maybeUser) throw redirect(returnTo);
		return maybeUser;
	}
}
