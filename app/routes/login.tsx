import type { ActionArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";

import { measure } from "~/utils/measure";

export function loader({ request, context }: ActionArgs) {
	return measure("routes/login#loader", async () => {
		await context.services.auth.authenticator.isAuthenticated(request, {
			successRedirect: "/",
		});

		let session = await context.services.auth.sessionStorage.getSession(
			request.headers.get("Cookie")
		);

		let error = session.get("auth:error");

		return json({ error });
	});
}

export function action({ request, context }: ActionArgs) {
	return measure("routes/login#action", async () => {
		return await context.services.auth.authenticator.authenticate(
			"github",
			request,
			{ successRedirect: "/", failureRedirect: "/login," }
		);
	});
}

export default function Component() {
	let { error } = useLoaderData<typeof loader>();
	return (
		<Form method="post">
			{error ? <p>{JSON.stringify(error, null, 2)}</p> : null}
			<button>Continue with GitHub</button>
		</Form>
	);
}
