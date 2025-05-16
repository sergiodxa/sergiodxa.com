import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { href, redirect } from "react-router";
import { z } from "zod";
import { connections, users } from "~/db/schema";
import { getDB } from "~/middleware/drizzle";
import { getSession } from "~/middleware/session";
import { authenticate } from "~/modules/auth.server";
import { GitHub } from "~/modules/github.server";
import type { Route } from "./+types/route";

const GitHubUserSchema = z.object({
	node_id: z.string(),
	email: z.string().email(),
	login: z.string(),
	name: z.string(),
	avatar_url: z.string().url(),
});

export async function loader({ request }: Route.LoaderArgs) {
	let session = getSession();
	if (session.has("user")) return redirect(href("/"));

	let tokens = await authenticate(request);
	let gh = new GitHub(env.GH_APP_ID, env.GH_APP_PEM);

	let profile = await gh.fetchUserProfile(tokens.accessToken());

	let db = getDB();

	let connection = await db.query.connections.findFirst({
		with: { user: { columns: { createdAt: false, updatedAt: false } } },
		where: and(
			eq(connections.providerName, "github"),
			eq(connections.providerId, profile.node_id),
		),
	});

	let user = connection?.user;

	if (user) {
		session.set("user", {
			...user,
			githubId: profile.node_id,
			isSponsor: await gh.isSponsoringMe(profile.node_id),
		});

		return redirect(href("/"));
	}

	let result = await db
		.insert(users)
		.values({
			role: "guess",
			email: profile.email,
			avatar: z.string().url().parse(profile.avatar_url),
			username: profile.login,
			displayName: profile.name,
		})
		.returning()
		.onConflictDoNothing({ target: users.email });

	user = result.at(0);
	if (!user) throw new Error("User was not created or found");

	await db.insert(connections).values({
		userId: user.id,
		providerName: "github",
		providerId: profile.node_id,
	});

	session.set("user", {
		id: user.id,
		role: user.role,
		email: user.email,
		avatar: user.avatar,
		username: user.username,
		displayName: user.displayName,
		githubId: profile.node_id,
		isSponsor: await gh.isSponsoringMe(profile.node_id),
	});

	return redirect(href("/"));
}
