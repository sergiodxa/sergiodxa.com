import type { LoaderArgs } from "@remix-run/cloudflare";

export async function loader({ context }: LoaderArgs) {
	return new Response("OK", { status: 200 });
}
