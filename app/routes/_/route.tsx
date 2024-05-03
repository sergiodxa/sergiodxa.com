import type { LinksFunction } from "@remix-run/cloudflare";

import {
	Outlet,
	isRouteErrorResponse,
	useRouteError,
	useSearchParams,
	useSubmit,
} from "@remix-run/react";

import { useT } from "~/helpers/use-i18n.hook";
import { useUser } from "~/helpers/use-user.hook";
import { Form } from "~/ui/Form";
import { Link } from "~/ui/Link";
import { SearchField } from "~/ui/SearchField";

import avatarHref from "./avatar.png";

export const links: LinksFunction = () => [
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
				: error.statusText ?? "Something went wrong";
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

function Header() {
	let submit = useSubmit();
	let [searchParams] = useSearchParams();
	let user = useUser();
	let t = useT("nav");

	let navigation = [
		{ name: t("home"), to: "/" },
		{ name: t("articles"), to: "/articles" },
		{ name: t("tutorials"), to: "/tutorials" },
		{ name: t("bookmarks"), to: "/bookmarks" },
		{ name: t("glossary"), to: "/glossary" },
	];

	if (user?.role === "admin") navigation.push({ name: t("cms"), to: "/cms" });

	let query = searchParams.get("q") ?? "";

	return (
		<header className="mx-auto flex max-w-screen-xl flex-col justify-between gap-x-1 gap-y-2 px-5 py-2 md:flex-row md:items-center">
			<nav aria-label="Main" className="flex-shrink-0">
				<ul className="flex flex-wrap items-center gap-x-4">
					{navigation.map((item) => {
						return (
							<li key={item.name}>
								<Link href={item.to}>{item.name}</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			<div className="flex flex-grow flex-col items-center justify-between gap-3 md:justify-end lg:flex-row">
				{user?.isSponsor ? null : (
					<Link
						href="https://github.com/sponsors/sergiodxa"
						className="hidden lg:block"
					>
						{t("sponsor")}
					</Link>
				)}

				<Form role="search">
					<SearchField
						label="Search"
						name="q"
						className="[&_label]:sr-only"
						placeholder="Remix, SWR, Next, Rails…"
						defaultValue={query}
						onSubmit={(q) => submit({ q })}
					/>

					<button type="submit" className="sr-only">
						Submit
					</button>
				</Form>
			</div>
		</header>
	);
}
