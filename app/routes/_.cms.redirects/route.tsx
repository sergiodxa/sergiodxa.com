import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { useId } from "react";

import { Logger } from "~/modules/logger.server";
import { Redirects } from "~/modules/redirects.server";
import { SessionStorage } from "~/modules/session.server";

import { RedirectsList } from "./list";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let redirects = new Redirects(context);
	let list = await redirects.list();

	return json({ list });
}

export async function action({ request, context }: ActionFunctionArgs) {
	void new Logger(context).http(request);

	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	return redirect("/cms/cache");
}

export default function Component() {
	let id = useId();

	return (
		<div className="flex flex-col gap-8 pb-10">
			<header className="flex justify-between gap-4 px-5">
				<h2 className="text-3xl font-bold">Redirects</h2>

				{/* <div className="flex items-center gap-4">
				</div> */}
			</header>

			<Form method="post" id={id}>
				<RedirectsList />
			</Form>
		</div>
	);
}
