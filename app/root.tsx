import type {
	LinksFunction,
	LoaderFunctionArgs,
	MetaDescriptor,
	MetaFunction,
} from "@remix-run/cloudflare";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import type { ReactNode } from "react";

import {
	isRouteErrorResponse,
	useRouteError,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useLocation,
} from "@remix-run/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { jsonHash } from "remix-utils/json-hash";
import { useShouldHydrate } from "remix-utils/use-should-hydrate";

import sansFont from "~/fonts/sans.woff2";
import { useDirection, useLocale } from "~/helpers/use-i18n.hook";
import { I18n } from "~/modules/i18n.server";
import { SessionStorage } from "~/modules/session.server";
import globalStylesUrl from "~/styles/global.css";
import tailwindUrl from "~/styles/tailwind.css";
import { removeTrailingSlash } from "~/utils/remove-trailing-slash";

export let links: LinksFunction = () => {
	return [
		{ rel: "preconnect", href: "https://static.cloudflareinsights.com" },
		{ rel: "preload", href: sansFont, as: "font" },
		{ rel: "preload", as: "style", href: "/fonts/sans" },
		{ rel: "preload", as: "style", href: tailwindUrl },
		{ rel: "preload", as: "style", href: globalStylesUrl },
		{ rel: "stylesheet", href: "/fonts/sans" },
		{ rel: "stylesheet", href: tailwindUrl },
		{ rel: "stylesheet", href: globalStylesUrl },
		{
			rel: "preload",
			href: "https://static.cloudflareinsights.com/beacon.min.js",
			as: "script",
		},
	];
};

export function loader({ request, context }: LoaderFunctionArgs) {
	return context.time("root#loader", async () => {
		removeTrailingSlash(new URL(request.url));

		let i18n = new I18n();
		let locale = await i18n.getLocale(request);

		return jsonHash(
			{
				locale,
				async meta(): Promise<MetaDescriptor[]> {
					let t = await i18n.getFixedT(locale);
					return [{ title: t("header.title") }];
				},
				async user() {
					return await SessionStorage.readUser(context, request);
				},
			},
			{ headers: { "Set-Cookie": await i18n.saveCookie(locale) } },
		);
	});
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
	return data?.meta ?? [];
};

export let shouldRevalidate: ShouldRevalidateFunction = ({
	defaultShouldRevalidate,
	formData,
}) => {
	if (formData) return false;
	return defaultShouldRevalidate;
};

export let handle: SDX.Handle = { i18n: "translation", hydrate: false };

export default function App() {
	let { locale } = useLoaderData<typeof loader>();
	useChangeLanguage(locale);

	return (
		<Document locale={locale}>
			<Outlet />
		</Document>
	);
}

export function ErrorBoundary() {
	let locale = useLocale();
	let error = useRouteError();

	if (process.env.NODE_ENV === "development") console.error(error);

	if (isRouteErrorResponse(error)) {
		return (
			<Document locale={locale} title={error.statusText}>
				{error.statusText}
			</Document>
		);
	}

	return (
		<Document locale={locale} title="Error!">
			Unexpected error
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
	let location = useLocation();

	return (
		<html lang={locale} dir={dir} className="h-full">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{title ? <title>{title}</title> : null}
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-transparent"
				/>
				<meta name="apple-mobile-web-app-title" content="Sergio Xalambrí" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="og:locale" content={locale} />
				<meta name="og:site_name" content="Sergio Xalambrí" />
				<meta name="og:type" content="website" />
				<meta name="theme-color" content="#c0c0c0" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:creator" content="@sergiodxa" />
				<meta name="twitter:site" content="@sergiodxa" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
				<meta name="author" content="Sergio Xalambrí" />
				<meta name="HandheldFriendly" content="True" />
				<meta name="language" content={locale} />
				<meta name="MobileOptimized" content="320" />
				<meta name="pagename" content="Sergio Xalambrí" />
				<meta name="title" content="Sergio Xalambrí" />
				<meta name="description" content="The blog of sergiodxa" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, viewport-fit=cover"
				/>
				<Meta />
				<Links />
				<link rel="alternate" type="application/rss+xml" href="/rss" />
				{/* <link rel="alternate" type="application/json" href="/feed.json" /> */}
				{/* <link rel="alternate" type="application/mf2+html" href="/feed.html" /> */}
				<link href="https://github.com/sergiodxa" rel="me authn" />
				<link
					rel="webmention"
					href="https://webmention.io/sergiodxa.com/webmention"
				/>
				<link
					rel="pingback"
					href="https://webmention.io/sergiodxa.com/xmlrpc"
				/>
				<link
					rel="canonical"
					href={`https://sergiodxa.com${location.pathname}`}
				/>
			</head>
			<body className="min-h-full bg-neutral-50 font-sans text-neutral-900">
				{children}
				<ScrollRestoration />
				{shouldHydrate || process.env.NODE_ENV === "development" ? (
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
