import { redirect, type ActionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

import { auth, returnToCookie } from "~/services/auth.server";

export async function action({ request, params, context }: ActionArgs) {
	invariant(params.provider, "provider is required");
	let returnTo = await returnToCookie.parse(request.headers.get("Cookie"));
	await auth.authenticate(params.provider, request, {
		successRedirect: returnTo ?? "/",
		failureRedirect: "/login",
		context,
	});
	return redirect("/login");
}
