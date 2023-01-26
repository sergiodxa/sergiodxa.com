import type {
	LinksFunction,
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/cloudflare";
import type { ReactNode } from "react";

import {
	Form,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
	useLoaderData,
} from "@remix-run/react";
import { NavLink } from "@remix-run/react/dist/components";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StructuredData, useShouldHydrate, jsonHash } from "remix-utils";

import avatarHref from "~/assets/avatar.png";
import { useDirection, useLocale, useT } from "~/helpers/use-i18n.hook";
import { i18n, localeCookie } from "~/i18n.server";
import globalStylesUrl from "~/styles/global.css";
import tailwindUrl from "~/styles/tailwind.css";
import { measure } from "~/utils/measure";
import { removeTrailingSlash } from "~/utils/remove-trailing-slash";

export let links: LinksFunction = () => {
	return [
		{ rel: "preconnect", href: "https://static.cloudflareinsights.com" },
		{ rel: "preload", as: "style", href: tailwindUrl },
		{ rel: "preload", as: "style", href: globalStylesUrl },
		{ rel: "stylesheet", href: tailwindUrl },
		{ rel: "stylesheet", href: globalStylesUrl },
		{
			rel: "preload",
			href: "https://static.cloudflareinsights.com/beacon.min.js",
			as: "script",
		},
	];
};

export function loader({ request, context }: LoaderArgs) {
	return measure("root#loader", async () => {
		removeTrailingSlash(new URL(request.url));

		let locale = await i18n.getLocale(request);

		return jsonHash(
			{
				locale,
				async user() {
					return await context.services.auth.authenticator.isAuthenticated(
						request
					);
				},
			},
			{ headers: { "Set-Cookie": await localeCookie.serialize(locale) } }
		);
	});
}

export let meta: MetaFunction = ({ data }) => {
	let { locale } = (data as SerializeFrom<typeof loader>) ?? {};
	return {
		"apple-mobile-web-app-capable": "yes",
		"apple-mobile-web-app-status-bar-style": "black-transparent",
		"apple-mobile-web-app-title": "Sergio Xalambrí",
		"mobile-web-app-capable": "yes",
		"og:locale": locale,
		"og:site_name": "Sergio Xalambrí",
		"og:type": "website",
		"theme-color": "#c0c0c0",
		"twitter:card": "summary_large_image",
		"twitter:creator": "@sergiodxa",
		"twitter:site": "@sergiodxa",
		"X-UA-Compatible": "IE=edge,chrome=1",
		author: "Sergio Xalambrí",
		HandheldFriendly: "True",
		language: locale,
		MobileOptimized: "320",
		pagename: "Sergio Xalambrí",
		title: "Sergio Xalambrí",
		description: "The blog of sergiodxa",
		viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
	};
};

export let handle: SDX.Handle = { i18n: "translation", hydrate: false };

export default function App() {
	let { locale } = useLoaderData<typeof loader>();
	useChangeLanguage(locale);

	return (
		<Document locale={locale}>
			<Header />

			<div className="mx-auto max-w-screen-sm py-10 px-4">
				<Outlet />
			</div>
		</Document>
	);
}

export function ErrorBoundary({ error }: { error: Error }) {
	if (process.env.NODE_ENV === "development") console.error(error);
	return (
		<Document locale={useLocale()} title="Error!">
			Unexpected error
		</Document>
	);
}

export function CatchBoundary() {
	let caught = useCatch();
	return (
		<Document locale={useLocale()} title={caught.statusText}>
			{caught.statusText}
		</Document>
	);
}

function Document({
	children,
	title,
	locale,
}: {
	children: ReactNode;
	title?: string;
	locale: string;
}) {
	let shouldHydrate = useShouldHydrate();
	let dir = useDirection();
	return (
		<html lang={locale} dir={dir} className="h-full">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{title ? <title>{title}</title> : null}
				<Meta />
				<Links />
				<link href="https://github.com/sergiodxa" rel="me authn" />
				<link
					rel="webmention"
					href="https://webmention.io/sergiodxa.com/webmention"
				/>
				<link
					rel="pingback"
					href="https://webmention.io/sergiodxa.com/xmlrpc"
				/>
				<StructuredData />
			</head>
			<body className="font-sans">
				{children}
				<ScrollRestoration />
				{shouldHydrate ? (
					<Scripts />
				) : (
					<script
						dangerouslySetInnerHTML={{
							__html: `
	document.querySelectorAll("a").forEach(($anchor) => {
		if ($anchor.origin !== location.origin) return;
		function listener() {
			let $link = document.createElement("link");
			$link.setAttribute("rel", "prefetch");
			$link.setAttribute("href", $anchor.href);
			document.body.appendChild($link);
		}
		$anchor.addEventListener("mouseenter", listener, { once: true });
	});
`,
						}}
					/>
				)}
				<LiveReload />
				{process.env.NODE_ENV === "production" ? (
					<script
						defer
						src="https://static.cloudflareinsights.com/beacon.min.js"
						data-cf-beacon='{"token": "4ac2c9f7b33a46508599d50ab6b96fc9"}'
					/>
				) : null}
			</body>
		</html>
	);
}

function useChangeLanguage(locale: string) {
	let { i18n } = useTranslation();
	useEffect(() => {
		i18n.changeLanguage(locale);
	}, [locale, i18n]);
}

function Header() {
	let { user } = useLoaderData<typeof loader>();
	let t = useT("translation");

	let navigation = [
		{ name: t("nav.home"), to: "/" },
		{ name: t("nav.articles"), to: "/articles" },
		// { name: t("nav.tutorials"), to: "/tutorials" },
		{ name: t("nav.bookmarks"), to: "/bookmarks" },
	] as const;

	return (
		<header className="bg-blue-600">
			<nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
				<div className="flex w-full flex-col justify-between gap-4 border-b border-blue-500 py-6 md:flex-row md:items-center md:gap-10 lg:border-none">
					<div className="flex items-center gap-10">
						<NavLink to="/" className="hidden flex-shrink-0 md:block">
							<span className="sr-only">{t("header.title")}</span>
							<img
								className="aspect-square h-10 h-10"
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
								className="block flex-shrink-0 flex-grow rounded-md border border-transparent bg-white py-2 px-4 text-center text-base font-medium text-blue-600 hover:bg-blue-50"
							>
								{t("nav.sponsor")}
							</a>
						) : null}

						{user === null ? (
							<Form method="post" action="/auth/login" className="contents">
								<button
									type="submit"
									className="hidden rounded-md border border-transparent bg-blue-500 py-2 px-4 text-base font-medium text-white hover:bg-opacity-75 lg:inline-block"
								>
									{t("nav.login")}
								</button>
							</Form>
						) : (
							<Form method="post" action="/auth/logout" className="contents">
								<button
									type="submit"
									className="hidden rounded-md border border-transparent bg-blue-500 py-2 px-4 text-base font-medium text-white hover:bg-opacity-75 lg:inline-block"
								>
									{t("nav.logout")}
								</button>
							</Form>
						)}
					</div>
				</div>
			</nav>
		</header>
	);
}
