#@remix-run/node@1.10.0 #@remix-run/react@1.10.0 #remix-utils@6.0.0

# Improve SEO by not sending JS in Remix

When Google crawls your website, it will try to execute all the JavaScript it finds. And even if your app is interactive before JS loads, it will increase the total time to load your page, which is unsuitable for SEO.

Luckily we can detect when we receive a document request from a bot (like Google's crawler) and stop sending any JS on the response.

Let's start by installing the `isbot` package if you don't already have it:

```ts
npm add isbot
```

> **Note**: New Remix apps come with it built-in.

Then, let's create a React context to pass to our app if the request is from a bot:

```ts
import type { ReactNode } from "react";

import { createContext, useContext } from "react";

type Props = { isBot: boolean; children: ReactNode };

const context = createContext(false);

export function useIsBot() {
  return useContext(context) ?? false;
}

export function IsBotProvider({ isBot, children }: Props) {
  return <context.Provider value={isBot}>{children}</context.Provider>;
}
```

Let's detect if the request comes from a bot in our `app/entry.server` file and wrap `RemixServer` in our context provider.

```tsx
// code above

let markup = renderToString(
  <IsBotProvider isBot={isbot(request.headers.get("User-Agent") ?? "")}>
    <RemixServer context={remixContext} url={request.url} />
  </IsBotProvider>
);

// code below
```

Or, if you're using streaming rendering:

```tsx
let body = await renderToReadableStream(
  <IsBotProvider isBot={isbot(request.headers.get("User-Agent") ?? "")}>
    <RemixServer context={context} url={request.url} />
  </IsBotProvider>,
  options // removed for brevity
);
```

Now, let's use this context in our `app/root` file to render the `<script>` tag conditionally:

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
import { useIsBot } from "~/is-bot.context"; // our context file

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  let isBot = useIsBot();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        {isBot ? null : <Scripts />}
        <LiveReload />
      </body>
    </html>
  );
}
```

If you're also adding scripts like Google Analytics, Facebook, etc., you can use this context to render scripts that usually affect performance conditionally.

That's it. Now, if the request comes from a bot, Remix will not send any JS to the client, but it will work as usual for regular users.

You can test it by running Lighthouse or WebPageTest against your website. It will be detected as a bot and don't send JS, increasing the performance score.

## Supporting Checkly

If you use Checkly to monitor your website (and if you don't, you should!), the `is-bot` function considers Checkly as a bot, which is technically correct, but we want to send JS there to test as a user.

To fix this, we can ask `isbot` to exclude Checkly for bot detection.

```tsx
isbot.exclude([
  "Checkly",
  "Checkly, https://www.checklyhq.com",
  "Checkly/1.0 (https://www.checklyhq.com)",
]);
```

With this, Checkly will receive JS, and the rest of the bots won't.

You can do this to ignore any other bot you want to send JS.
