import type { ActionArgs } from "@remix-run/cloudflare";

import { Form } from "@remix-run/react";

import { useT } from "~/helpers/use-i18n.hook";

export async function action({ request, context }: ActionArgs) {
	return await context.services.auth.authenticator.logout(request, {
		redirectTo: "/",
	});
}

export default function Component() {
	let t = useT();
	return (
		<Form method="post">
			<h1>{t("Are you sure you want to sign out?")}</h1>
			<button>Sign Out</button>
		</Form>
	);
}
