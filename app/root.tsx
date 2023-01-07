import type {
	LinksFunction,
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/cloudflare";
import type { ReactNode } from "react";

import {
	Link,
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
import { StructuredData, useShouldHydrate } from "remix-utils";

import { useDirection, useLocale, useT } from "~/helpers/use-i18n.hook";
import { i18n, localeCookie } from "~/services/i18n.server";
import globalStylesUrl from "~/styles/global.css";
import tailwindUrl from "~/styles/tailwind.css";
import { removeTrailingSlash } from "~/utils/remove-trailing-slash";

import { json } from "./utils/http";
import { measure } from "./utils/measure";

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

		return json(
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
	let { locale, user } = useLoaderData<typeof loader>();
	let t = useT();

	useChangeLanguage(locale);

	return (
		<Document locale={locale}>
			<header className="mb-4">
				<h1 className="text-4xl font-black leading-none">
					{t("header.title")}
				</h1>
			</header>

			<nav className="mb-4 flex flex-wrap items-center justify-between gap-x-4 border-b border-black pb-1">
				<ul className="flex space-x-4 text-lg">
					<li>
						<NavLink to="/" className="py-3">
							{t("nav.home")}
						</NavLink>
					</li>
					<li>
						<NavLink to="/articles" className="py-3">
							{t("nav.articles")}
						</NavLink>
					</li>
					<li>
						<NavLink to="/bookmarks" className="py-3">
							{t("nav.bookmarks")}
						</NavLink>
					</li>
				</ul>

				<aside className="flex md:justify-end">
					{!user?.isSponsor ? (
						<a href="https://github.com/sponsors/sergiodxa">
							{t("nav.sponsor")}
						</a>
					) : (
						<Link to="/logout">{t("nav.logout")}</Link>
					)}
				</aside>
			</nav>

			{user !== null ? (
				<div>
					<img src={user.avatar} alt="" width={64} height={64} />
					<p>Hello {user.displayName}</p>
				</div>
			) : null}

			<Outlet />
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
			<body className="mx-auto max-w-screen-sm py-10 px-4 font-sans">
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
