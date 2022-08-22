import { RemixBrowser } from "@remix-run/react";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { getInitialNamespaces } from "remix-i18next";

import en from "~/locales/en";
import es from "~/locales/es";

i18next
	.use(initReactI18next)
	.use(LanguageDetector)
	.init({
		supportedLngs: ["es", "en"],
		fallbackLng: "en",
		react: { useSuspense: false },
		ns: getInitialNamespaces(),
		detection: { order: ["htmlTag"], caches: [] },
		resources: { en: { translation: en }, es: { translation: es } },
	})
	.then(hydrate);

function hydrate() {
	startTransition(() => {
		hydrateRoot(
			document,
			<I18nextProvider i18n={i18next}>
				<StrictMode>
					<RemixBrowser />
				</StrictMode>
			</I18nextProvider>
		);
	});
}
