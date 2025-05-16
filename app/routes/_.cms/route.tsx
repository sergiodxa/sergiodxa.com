import { Outlet, href, redirect } from "react-router";
import { getUser } from "~/middleware/session";
import type { Route } from "./+types/route";
import { Navigation } from "./nav";

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
	(_, next) => {
		let user = getUser();
		if (user?.role === "admin") return next();
		return redirect(href("/"));
	},
];

export default function Component() {
	return (
		<main className="-my-4 mx-auto flex max-w-screen-xl flex-col gap-8">
			<Navigation />
			<Outlet />
		</main>
	);
}
