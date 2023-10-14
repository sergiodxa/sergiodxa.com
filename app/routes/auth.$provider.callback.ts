import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { z } from "zod";

export function loader(_: LoaderFunctionArgs) {
	return _.context.time("routes/auth.$provider.callback#loader", async () => {
		let provider = z.enum(["github"]).parse(_.params.provider);

		return await _.context.services.auth.authenticator.authenticate(
			provider,
			_.request,
			{ successRedirect: "/", failureRedirect: "/auth/login" },
		);
	});
}
