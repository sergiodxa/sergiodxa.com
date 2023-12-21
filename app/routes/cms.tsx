import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Outlet } from "react-router";

import { SessionStorage } from "~/modules/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/login");
	return json({ user });
}

export default function Component() {
	return (
		<>
			<h1>CMS</h1>
			<Outlet />
		</>
	);
}
