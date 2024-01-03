import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";

import { useT } from "~/helpers/use-i18n.hook";
import { Auth } from "~/modules/auth.server";
import { SessionStorage } from "~/modules/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	let user = await SessionStorage.readUser(context, request);
	if (!user) return json(null);
	throw redirect("/");
}

export async function action({ request, context }: ActionFunctionArgs) {
	let auth = new Auth(context);

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
		>
			<header className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
					{t("title")}
				</h2>
			</header>

			<button
				type="submit"
				className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-blue-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			>
				{t("github")}
			</button>
		</Form>
	);
}
