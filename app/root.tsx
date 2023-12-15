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
	Form,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	NavLink,
} from "@remix-run/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { jsonHash } from "remix-utils/json-hash";
import { useShouldHydrate } from "remix-utils/use-should-hydrate";

import avatarHref from "~/assets/avatar.png";
import sansFont from "~/fonts/sans.woff2";
import { useDirection, useLocale, useT } from "~/helpers/use-i18n.hook";
import { i18n, localeCookie } from "~/i18n.server";
import globalStylesUrl from "~/styles/global.css";
import tailwindUrl from "~/styles/tailwind.css";
import { removeTrailingSlash } from "~/utils/remove-trailing-slash";

import { SessionStorage } from "./modules/session.server";

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

		let locale = await i18n.getLocale(request);

		return jsonHash(
			{
				locale,
				async meta(): Promise<MetaDescriptor[]> {
					let t = await i18n.getFixedT(locale);
					return [{ title: t("header.title") }];
				},
				async user() {
					return await SessionStorage.readUser(
						{ kv: context.kv.auth },
						request,
						context.env.COOKIE_SESSION_SECRET,
					);
				},
			},
			{ headers: { "Set-Cookie": await localeCookie.serialize(locale) } },
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
			<Header />

			<div className="p-4">
				<Outlet />
			</div>
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
				<link href="https://github.com/sergiodxa" rel="me authn" />
				<link
					rel="webmention"
					href="https://webmention.io/sergiodxa.com/webmention"
				/>
				<link
					rel="pingback"
					href="https://webmention.io/sergiodxa.com/xmlrpc"
				/>
			</head>
			<body className="bg-neutral-50 font-sans text-neutral-900">
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

function Header() {
	let { user } = useLoaderData<typeof loader>();
	let t = useT("translation");

	let navigation = [
		{ name: t("nav.home"), to: "/" },
		{ name: t("nav.articles"), to: "/articles" },
		{ name: t("nav.tutorials"), to: "/tutorials" },
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
								{t("nav.sponsor")}
							</a>
						) : null}

						{!user ? (
							<Form method="post" action="/auth/login" className="contents">
								<button
									type="submit"
									className="hidden rounded-md border border-transparent bg-blue-500 px-4 py-2 text-base font-medium text-white hover:bg-opacity-75 lg:inline-block"
								>
									{t("nav.login")}
								</button>
							</Form>
						) : (
							<Form method="post" action="/auth/logout" className="contents">
								<button
									type="submit"
									className="hidden rounded-md border border-transparent bg-blue-500 px-4 py-2 text-base font-medium text-white hover:bg-opacity-75 lg:inline-block"
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
