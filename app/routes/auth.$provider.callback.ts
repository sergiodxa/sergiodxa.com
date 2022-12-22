import type { LoaderArgs } from "@remix-run/cloudflare";

import { z } from "zod";

export async function loader({ request, params, context }: LoaderArgs) {
	let provider = z.enum(["github"]).parse(params.provider);

	return await context.services.auth.authenticator.authenticate(
		provider,
		request,
		{ successRedirect: "/", failureRedirect: "/login" }
	);
}
