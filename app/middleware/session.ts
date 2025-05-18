import { env } from "cloudflare:workers";
import { createWorkersKVSessionStorage } from "@react-router/cloudflare";
import { createCookie, href, redirect } from "react-router";
import { z } from "zod";
import { unstable_createSessionMiddleware } from "~/vendor/remix-utils/session";
import { getContext } from "./context-storage";

export const UserSchema = z.object({
	id: z.string().uuid(),
	role: z.enum(["admin", "guest"]),
	email: z.string().email().max(320),
	avatar: z.string().url().max(2048),
	username: z.string().min(1).max(39),
	displayName: z.string().min(1).max(255),
	githubId: z.string().min(1),
	isSponsor: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;

export const SessionDataSchema = z.object({
	user: UserSchema.optional(),
});

export type SessionData = z.output<typeof SessionDataSchema>;

const cookie = createCookie("sdx:session", {
	path: "/",
	maxAge: 60 * 60 * 24 * 365, // 1 year
	httpOnly: true,
	sameSite: "lax",
	secure: process.env.NODE_ENV === "production",
	secrets: [env.COOKIE_SESSION_SECRET ?? "s3cr3t"],
});

const sessionStorage = createWorkersKVSessionStorage<SessionData>({
	kv: env.AUTH,
	cookie,
});

const [sessionMiddleware, getSessionFromContext] =
	unstable_createSessionMiddleware(sessionStorage);

export function getSession() {
	let context = getContext();
	return getSessionFromContext(context);
}

export { sessionMiddleware };

export function getUser() {
	let session = getSession();
	return session.get("user");
}

export function requireUser() {
	let user = getUser();
	if (user) return user;
	throw redirect(href("/auth/login"));
}

export async function logout() {
	let session = getSession();
	session.unset("user"); // unset just in case
	return redirect(href("/"), {
		headers: {
			"Set-Cookie": await sessionStorage.destroySession(session),
			"Clear-Site-Data": '"*"',
		},
	});
}
