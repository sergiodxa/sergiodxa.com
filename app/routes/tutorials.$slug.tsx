import type { LoaderArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { z } from "zod";

export async function loader({ params, context }: LoaderArgs) {
	let slug = z.string().parse(params.slug);

	let result = await context.services.tutorials.read.perform(slug);

	if (!result) return json({ tutorial: null, related: null }, { status: 404 });

	let headers = new Headers();

	return json(result, { headers });
}
