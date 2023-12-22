import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Outlet } from "react-router";

import { SessionStorage } from "~/modules/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	return json({ user });
}

export default function Component() {
	return (
		<main className="mx-auto flex max-w-screen-xl flex-col gap-8">
			<h1 className="text-xl font-bold">CMS</h1>
			<Outlet />
		</main>
	);
}
