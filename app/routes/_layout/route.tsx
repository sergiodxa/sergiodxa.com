import type { LinksFunction } from "@remix-run/cloudflare";

import { Form, NavLink, Outlet } from "@remix-run/react";

import { useT } from "~/helpers/use-i18n.hook";
import { useUser } from "~/helpers/use-user.hook";

import avatarHref from "./avatar.png";

export let links: LinksFunction = () => {
	return [{ rel: "preload", as: "image", href: avatarHref }];
};

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
	return (
		<>
			<Header />

			<div className="p-4">
				<h1>Something went wrong</h1>
			</div>
		</>
	);
}

function Header() {
	let user = useUser();
	let t = useT("nav");

	let navigation = [
		{ name: t("home"), to: "/" },
		{ name: t("articles"), to: "/articles" },
		{ name: t("tutorials"), to: "/tutorials" },
		{ name: t("bookmarks"), to: "/bookmarks" },
	] as const;

	return (
		<header className="bg-blue-600">
			<nav className="mx-auto max-w-screen-xl px-6 lg:px-8" aria-label="Top">
				<div className="flex w-full flex-col justify-between gap-4 border-b border-blue-500 py-6 md:flex-row md:items-center md:gap-10 lg:border-none">
					<div className="flex items-center gap-10">
						<NavLink to="/" className="hidden flex-shrink-0 md:block">
							<span className="sr-only">{t("header.title")}</span>
							<img
								className="aspect-square h-10"
								width={40}
								height={40}
								src={avatarHref}
								alt=""
							/>
						</NavLink>

						<div className="flex flex-wrap items-center gap-x-6 gap-y-4">
							{navigation.map((link) => (
								<NavLink
									key={link.name}
									to={link.to}
									className="text-base font-medium text-white hover:text-blue-50"
								>
									{link.name}
								</NavLink>
							))}
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-end gap-4">
						{!user?.isSponsor ? (
							<a
								href="https://github.com/sponsors/sergiodxa"
								className="block flex-shrink-0 flex-grow rounded-md border border-transparent bg-white px-4 py-2 text-center text-base font-medium text-blue-600 hover:bg-blue-50"
							>
								{t("sponsor")}
							</a>
						) : null}

						{!user ? (
							<Form method="post" action="/auth/login" className="contents">
								<button
									type="submit"
									className="hidden rounded-md border border-transparent bg-blue-500 px-4 py-2 text-base font-medium text-white hover:bg-opacity-75 lg:inline-block"
								>
									{t("login")}
								</button>
							</Form>
						) : (
							<Form
								method="post"
								action="/auth/logout"
								reloadDocument
								className="contents"
							>
								<button
									type="submit"
									className="hidden rounded-md border border-transparent bg-blue-500 px-4 py-2 text-base font-medium text-white hover:bg-opacity-75 lg:inline-block"
								>
									{t("logout")}
								</button>
							</Form>
						)}
					</div>
				</div>
			</nav>
		</header>
	);
}
