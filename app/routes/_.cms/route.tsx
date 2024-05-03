import { type LoaderFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { Outlet } from "react-router";

import { SessionStorage } from "~/modules/session.server";

import { Navigation } from "./nav";

export const handle: SDX.Handle = { hydrate: true };

export async function loader({ request, context }: LoaderFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");
	return json({ user });
}

export default function Component() {
	return (
		<main className="-my-4 mx-auto flex max-w-screen-xl flex-col gap-8">
			<Navigation />
			<Outlet />
		</main>
	);
}
