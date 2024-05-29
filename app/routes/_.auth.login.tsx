import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";

import { useT } from "~/helpers/use-i18n.hook";
import { Auth } from "~/modules/auth.server";
import { SessionStorage } from "~/modules/session.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";

export async function loader({ request, context }: LoaderFunctionArgs) {
	let user = await SessionStorage.readUser(context, request);
	if (!user) return json(null);
	throw redirect("/");
}

export async function action({ request, context }: ActionFunctionArgs) {
	let auth = new Auth(new URL(request.url), context);

	return await auth.authenticate("github", request, {
		successRedirect: "/auth/github/callback",
		failureRedirect: "/auth/login",
	});
}

export default function Component() {
	let t = useT("login");

	return (
		<Form
			method="post"
			className="mx-auto flex max-w-screen-sm flex-col items-center gap-10 pt-10"
			reloadDocument
		>
			<header className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="text-center text-3xl font-bold tracking-tight">
					{t("title")}
				</h2>
			</header>

			<Button type="submit" variant="primary">
				{t("github")}
			</Button>
		</Form>
	);
}
