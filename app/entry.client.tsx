import { SSRProvider } from "@react-aria/ssr";
import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";
import { i18nextInit, RemixI18NextProvider } from "./services/i18next";

i18nextInit().then((i18n) => {
  hydrate(
    <SSRProvider>
      <RemixI18NextProvider i18n={i18n}>
        <RemixBrowser />
      </RemixI18NextProvider>
    </SSRProvider>,
    document
  );
});
