#@remix-run/node@1.10.0 #@remix-run/react@1.10.0

# Use Remix as a SPA only

Remix always does SSR on document requests. Then it works as an MPA until JS loads and React hydrates your app. At that point, it starts working as a SPA.

But you could go to full SPA mode. Let's see how.

> **Note**: This is more an experiment than a recommended way to use Remix. If you want Remix as only SPA, use React Router instead.

Once you create a new Remix app, you will have an `app/root` file like this.

```tsx
import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

The `Outlet` component used there is where our routes will render. In our case, we need to prevent the rendering server-side because we want a SPA-only mode, so let's install Remix Utils.

```sh
npm add remix-utils
```

Then we can wrap the `Outlet` component in the Remix Util's `ClientOnly` component.

```tsx
import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { ClientOnly } from "remix-utils";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <ClientOnly>
          <Outlet />
        </ClientOnly>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

With this change, you'll notice that your app now renders empty on a document request, and once JS hydrates, it renders the actual UI.

Let's add a generic skeleton UI to make it look better.

```tsx
import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { ClientOnly } from "remix-utils";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <ClientOnly fallback={<Skeleton />}>
          <Outlet />
        </ClientOnly>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function Skeleton() {
  // here, create a skeleton UI for your app
}
```

Now, let's ensure you send the HTML as if it were static. We will use Cache-Control in the `app/entry.server` file.

```tsx
import { PassThrough } from "stream";
import type { EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";

// install this to help you generate Cache-Control strings
import { cacheHeader } from "pretty-cache-header";

const ABORT_DELAY = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  // Add the Cache-Control header
  request.headers.set(
    "Cache-Control",
    cacheHeader({
      public: true,
      maxAge: "1day",
      staleWhileRevalidate: "1year",
    })
  );

  return isbot(request.headers.get("user-agent"))
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext
      );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  //omitted for brevity. You can see the complete code in the default entry.server
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  // omitted for brevity. You can see the complete code in the default entry.server
}
```

Now, you can deploy your app and enjoy your SPA-only Remix app. To do it more thoroughly, avoid using UI route-level `loader` and `action` functions, and instead, use the `useFetcher` hook to trigger the fetch 100% from the browser.
