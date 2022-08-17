import { type LoaderArgs } from "@remix-run/node";

export async function loader({ context }: LoaderArgs) {
	await context!.db.user.count();
	return new Response("OK", { status: 200 });
}
