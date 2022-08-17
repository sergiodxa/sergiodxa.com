import { type User } from "@prisma/client";
import { json, type LoaderArgs } from "@remix-run/node";

import { auth } from "~/services/auth.server";

export async function loader({ request, context }: LoaderArgs) {
	let userId = await auth.isAuthenticated(request);
	if (!userId) return json(null);

	let user = await context!.db.user.findUnique({ where: { id: userId } });
	if (!user) return json(null);
	return json<User>(user);
}
