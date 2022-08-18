import { RemixBrowser } from "@remix-run/react";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-fetch-backend";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { getInitialNamespaces } from "remix-i18next";

i18next
	.use(initReactI18next)
	.use(LanguageDetector)
	.use(Backend)
	.init({
		supportedLngs: ["es", "en"],
		fallbackLng: "en",
		react: { useSuspense: false },
		ns: getInitialNamespaces(),
		backend: { loadPath: "/locales/{{lng}}/{{ns}}.json" },
		detection: { order: ["htmlTag"], caches: [] },
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
