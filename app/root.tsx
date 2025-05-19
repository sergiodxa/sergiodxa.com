import { useTranslation } from "react-i18next";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
} from "react-router";
import { useChangeLanguage } from "remix-i18next/react";
import sansFont from "~/fonts/sans.woff2";
import {
	getI18nextInstance,
	getLocale,
	cookie as i18nCookie,
	i18nextMiddleware,
} from "~/middleware/i18next";
import { noWWWMiddleware } from "~/middleware/no-www";
import styles from "~/styles.css?url";
import type { Route } from "./+types/root";
import { ok } from "./helpers/response";
import { cacheMiddleware } from "./middleware/cache";
import { contextStorageMiddleware } from "./middleware/context-storage";
import { drizzleMiddleware } from "./middleware/drizzle";
import { noTrailingSlashMiddleware } from "./middleware/no-trailing-slash";
import { rollingCookieMiddleware } from "./middleware/rolling-cookie";
import { serverTimingMiddleware } from "./middleware/server-timing";
import { getUser, sessionMiddleware } from "./middleware/session";

export const meta: Route.MetaFunction = ({ data }) => data?.meta ?? [];

export const unstable_middleware = [
	noWWWMiddleware,
	noTrailingSlashMiddleware,
	contextStorageMiddleware,
	rollingCookieMiddleware,
	serverTimingMiddleware,
	i18nextMiddleware,
	sessionMiddleware,
	drizzleMiddleware,
	cacheMiddleware,
];

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://static.cloudflareinsights.com" },
	{ rel: "preload", href: sansFont, as: "font" },
	{ rel: "preload", as: "style", href: styles },
	{ rel: "stylesheet", href: styles },
	{
		rel: "preload",
		href: "https://static.cloudflareinsights.com/beacon.min.js",
		as: "script",
	},
	{ rel: "alternate", type: "application/rss+xml", href: "/rss" },
	{ rel: "me authn", href: "https://github.com/sergiodxa" },
];

export async function loader(_: Route.LoaderArgs) {
	let { t } = getI18nextInstance();
	let locale = getLocale();

	return ok(
		{
			locale,
			user: getUser(),
			meta: [
				{ title: t("home.meta.title.default") },
				{ name: "og:title", content: t("home.meta.title.default") },
			] satisfies Route.MetaDescriptors,
		},
		{ headers: { "Set-Cookie": await i18nCookie.serialize(locale) } },
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	let { i18n } = useTranslation();

	return (
		<html lang={i18n.language} dir={i18n.dir(i18n.language)} className="h-full">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-transparent"
				/>
				<meta name="apple-mobile-web-app-title" content="Sergio Xalambrí" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="og:locale" content={i18n.language} />
				<meta name="og:site_name" content="Sergio Xalambrí" />
				<meta name="og:type" content="website" />
				<meta name="theme-color" content="#c0c0c0" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:creator" content="@sergiodxa" />
				<meta name="twitter:site" content="@sergiodxa" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
				<meta name="author" content="Sergio Xalambrí" />
				<meta name="HandheldFriendly" content="True" />
				<meta name="language" content={i18n.language} />
				<meta name="MobileOptimized" content="320" />
				<meta name="pagename" content="Sergio Xalambrí" />
				<meta name="title" content="Sergio Xalambrí" />
				<meta name="description" content="The blog of sergiodxa" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, viewport-fit=cover"
				/>
				<Links />
			</head>
			<body className="min-h-full bg-white font-sans text-black dark:bg-zinc-900 dark:text-zinc-50">
				{children}
				<ScrollRestoration />
				<Scripts />
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

export default function Component({ loaderData }: Route.ComponentProps) {
	useChangeLanguage(loaderData.locale);
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
