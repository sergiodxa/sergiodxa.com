import type { i18n } from "i18next";
import { createInstance } from "i18next";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { useMatches } from "@remix-run/react";
import type { Language } from "remix-i18next";
import useConsistentValue from "use-consistent-value";

export let supportedLngs: string[] = ["en"];
export let fallbackLng: "en";

export async function i18nextInit() {
  let i18n = createInstance();
  await i18n.use(initReactI18next).init({
    supportedLngs,
    fallbackLng,
    fallbackNS: "common",
    defaultNS: "common",
    keySeparator: false,
    nsSeparator: false,
    react: { useSuspense: false },
  });
  return i18n;
}

let context = createContext<i18n | null>(null);

function useInstance() {
  let value = useContext(context);
  if (!value) throw new Error("Missing I18Next instance");
  return value;
}

export function useSetupI18N(locale: string) {
  if (!locale) throw new Error("Missing locale");

  let instance = useInstance();

  let namespaces = useConsistentValue(
    useMatches()
      .flatMap((match) => (match.data?.i18n ?? {}) as Record<string, Language>)
      // eslint-disable-next-line unicorn/no-array-reduce
      .reduce(
        (messages, routeMessages) => ({ ...messages, ...routeMessages }),
        {}
      )
  );

  useMemo(() => {
    void instance.changeLanguage(locale);
    for (let [namespace, messages] of Object.entries(namespaces)) {
      instance.addResourceBundle(locale, namespace, messages);
    }
  }, [instance, namespaces, locale]);
}

interface RemixI18NextProvider {
  children: ReactNode;
  i18n: i18n;
}

export function RemixI18NextProvider({ children, i18n }: RemixI18NextProvider) {
  return (
    <context.Provider value={i18n}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </context.Provider>
  );
}
