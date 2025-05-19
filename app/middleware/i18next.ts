import { env } from "cloudflare:workers";
import { createCookie } from "react-router";
import { unstable_createI18nextMiddleware } from "remix-i18next/middleware";
import en from "~/locales/en";
import es from "~/locales/es";
import { getContext } from "./context-storage";

export const cookie = createCookie("sdx:i18n", {
	path: "/",
	httpOnly: true,
	sameSite: "lax",
	secure: process.env.NODE_ENV === "production",
	secrets: [env.COOKIE_SESSION_SECRET ?? "s3cr3t"],
});

const [i18nextMiddleware, getLocaleFromContext, getInstanceFromContext] =
	unstable_createI18nextMiddleware({
		detection: {
			supportedLanguages: ["es", "en"],
			fallbackLanguage: "en",
			cookie,
		},
		i18next: {
			resources: {
				en: { translation: en },
				es: { translation: es },
			},
		},
	});

export function getLocale() {
	return getLocaleFromContext(getContext());
}

export function getI18nextInstance() {
	return getInstanceFromContext(getContext());
}

export { i18nextMiddleware };

declare module "i18next" {
	interface CustomTypeOptions {
		resources: {
			translation: typeof en;
		};
	}
}
