import type { ActionArgs } from "@remix-run/cloudflare";

import { Form } from "@remix-run/react";

export async function action({ request, context }: ActionArgs) {
	return await context.services.auth.authenticator.authenticate(
		"github",
		request,
		{ successRedirect: "/", failureRedirect: "/login," }
	);
}

export default function Component() {
	return (
		<Form method="post">
			<button>Continue with GitHub</button>
		</Form>
	);
}
