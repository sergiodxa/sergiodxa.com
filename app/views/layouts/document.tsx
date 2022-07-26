import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { ReactNode } from "react";
import { useShouldHydrate } from "remix-utils";
import { useDirection } from "~/helpers/use-i18n.hook";

type DocumentProps = {
  children: ReactNode;
  title?: string;
  locale: string;
};

export function Document({ children, title, locale }: DocumentProps) {
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
      </head>
      <body className="h-full">
        {children}
        <ScrollRestoration />
        {shouldHydrate && <Scripts />}
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
