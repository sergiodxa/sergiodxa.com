import { createCookie } from "@remix-run/cloudflare";
import { RemixI18Next } from "remix-i18next/server";

import en from "~/locales/en";
import es from "~/locales/es";

export class I18n {
	protected cookie = createCookie("locale", {
		path: "/",
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
	});

	protected i18n = new RemixI18Next({
		detection: {
			fallbackLanguage: "en",
			supportedLanguages: ["cimode", "es", "en"],
			cookie: this.cookie,
		},
		i18next: {
			supportedLngs: ["es", "en"],
			resources: { en: { translation: en }, es: { translation: es } },
		},
	});

	public getLocale: RemixI18Next["getLocale"] = this.i18n.getLocale.bind(
		this.i18n,
	);

	public getFixedT: RemixI18Next["getFixedT"] = this.i18n.getFixedT.bind(
		this.i18n,
	);

	public async saveCookie(locale: string): Promise<string>;
	public async saveCookie(request: Request): Promise<string>;
	public async saveCookie(locale: string | Request) {
		if (locale instanceof Request) {
			locale = await this.getLocale(locale);
		}
		return await this.cookie.serialize(locale);
	}
}
