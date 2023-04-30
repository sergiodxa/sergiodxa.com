import type { DataFunctionArgs } from "@remix-run/cloudflare";

import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { json } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";

import { useT } from "~/helpers/use-i18n.hook";

export function loader(_: DataFunctionArgs) {
	return _.context.time("routes/login#loader", async () => {
		let session = await _.context.services.auth.sessionStorage.getSession(
			_.request.headers.get("Cookie")
		);
		let error = session.get("auth:error");
		return json({ error });
	});
}

export function action(_: DataFunctionArgs) {
	return _.context.time("routes/login#action", async () => {
		return await _.context.services.auth.authenticator.authenticate(
			"github",
			_.request,
			{ successRedirect: "/", failureRedirect: "/login," }
		);
	});
}

export default function Component() {
	let t = useT("translation");

	return (
		<Form
			method="post"
			className="mx-auto flex max-w-screen-sm flex-col items-center gap-10 pt-10"
		>
			<header className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
					{t("login.title")}
				</h2>
			</header>

			<button
				type="submit"
				className="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-blue-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			>
				{t("login.github")}
			</button>

			<Alert />
		</Form>
	);
}

function Alert() {
	let { error } = useLoaderData<typeof loader>();
	let t = useT("translation");

	if (!error) return null;

	return (
		<div className="w-full rounded-md bg-red-50 p-4">
			<div className="flex">
				<div className="flex-shrink-0">
					<ExclamationTriangleIcon
						className="h-5 w-5 text-red-400"
						aria-hidden="true"
					/>
				</div>
				<div className="ml-3">
					<h3 className="text-sm font-medium text-red-800">
						{t("login.error.title")}
					</h3>
					<div className="mt-2 text-sm text-red-700">
						<p>{t("login.error.description")}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
