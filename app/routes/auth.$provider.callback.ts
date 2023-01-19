import type { LoaderArgs } from "@remix-run/cloudflare";

import { redirect } from "@remix-run/cloudflare";
import { z } from "zod";

import { measure } from "~/utils/measure";

export function loader({ request, params, context }: LoaderArgs) {
	return measure("routes/auth.$provider.callback#loader", async () => {
		let provider = z.enum(["github"]).parse(params.provider);

		try {
			return await context.services.auth.authenticator.authenticate(
				provider,
				request,
				{ successRedirect: "/" }
			);
		} catch (error) {
			if (error instanceof Response) return error;
			console.log(error);
			return redirect("/login");
		}
	});
}
