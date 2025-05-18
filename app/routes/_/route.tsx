import { Outlet, isRouteErrorResponse, useRouteError } from "react-router";
import type { Route } from "./+types/route";
import avatarHref from "./avatar.png";
import { Header } from "./components/header";

export const links: Route.LinksFunction = () => [
	{ rel: "preload", as: "image", href: avatarHref },
];

export default function Component() {
	return (
		<>
			<Header />

			<div className="p-4">
				<Outlet />
			</div>
		</>
	);
}

export function ErrorBoundary() {
	let error = useRouteError();

	let title = "Something went wrong";

	if (isRouteErrorResponse(error)) {
		title =
			error.status === 404
				? "Content not found"
				: (error.statusText ?? "Something went wrong");
	} else if (error instanceof Error) {
		title = error.message;
	}

	return (
		<>
			<Header />

			<article className="prose prose-blue mx-auto flex max-w-screen-md flex-col gap-8 px-4 pb-14 pt-20 dark:prose-invert">
				<header className="gap-4 md:flex md:items-start md:justify-between">
					<h1>{title}</h1>
				</header>
			</article>
		</>
	);
}
