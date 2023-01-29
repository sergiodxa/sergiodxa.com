#@remix-run/node@1.11.1 #@remix-run/react@1.11.1 #pretty-cache-header@1.0.0 #react@18.2.0

# Add runtime SSG and ISR to Remix

If you came to Remix from the Next.js world, you might wonder how to use SSG and ISR with Remix.

The framework doesn't support it; instead, the typical recommendation is to use [HTTP cache](https://sergiodxa.com/articles/http-vs-server-side-cache-in-remix#http-cache) to get similar behavior.

Let's see how we could use HTTP cache to implement SSG and ISR at runtime instead of build time.

## Add Cache-Control headers

First, we need to add the Cache-Control header to the document responses.

Let's do that by changing our `handleRequest` function in `entry.server`

```ts
// help us create the string for the Cache-Control header
import { cacheHeader } from "pretty-cache-header";

let versionCookie = createCookie("version", {
  path: "/", // make sure the cookie we receive the request on every path
  secure: false, // enable this in prod
  httpOnly: true, // only for server-side usage
  maxAge: 60 * 60 * 24 * 365, // keep the cookie for a year
});

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  await sleep(300); // delay response by 300ms to verify our cache is working

  let { version } = remixContext.manifest; // get the build version

  // if the response doesn't already have a cache-control header, add one
  if (!responseHeaders.has("cache-control")) {
    responseHeaders.append(
      "cache-control",
      cacheHeader({
        public: true, // cache on CDN
        private: false, // cache on browser
        maxAge: "60s", // cache time
        staleWhileRevalidate: "1y", // enables ISR
        staleIfError: "1y", // enables ISR
      })
    );
  }

  // Add new headers to the response
  responseHeaders.append("Vary", "Cookie");
  responseHeaders.append("Set-Cookie", await versionCookie.serialize(version));

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
```

The `Vary` header tells the cache that if the Cookie header is different, it shouldn't use the same cache.

Then we set the `Set-Cookie` header to keep the build version.

With this, if we open the page in the browser, it will get cached. If we open it in a new tab, we shouldn't need to wait for the 300ms delay and instead get the HTML immediately.

> > **Note**: If you reload the page, the browser will use a no-cache policy and request the document again. To test this works, open a new tab, open the dev tools and then type the URL and enter.

## Add API routes

Now, we can test our app to keep working, add an API route, for example, `routes/api.time.ts` and export a loader or action.

```ts
import type { DataFunctionArgs, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

export function loader(_: DataFunctionArgs) {
  return json({ time: new Date().toISOString() });
}

// Note we use a named export and not a default one,
// We're implementing the Full Stack Components pattern by Kent C. Dodds
// Read more about this on https://www.epicweb.dev/full-stack-components
export function Time() {
  let { data, load } = useFetcher<SerializeFrom<typeof loader>>();

  useEffect(() => {
    load("/api/time");
  }, [load]);

  if (!data) return <div>Loading...</div>;
  return <div>{data.time}</div>;
}
```

Then, in another route of our app, consume it.

```tsx
import { Time } from "./api.time";

export default function Component() {
  return <Time />;
}
```

Now, even if the user received a cached HTML, it will still fetch the API to get the current time.

## Add public data to routes

A use case for SSG could be to generate routes with public data and fetch private data from the API client side.

Let's add some public data we want to cache to our route.

```tsx
import type { DataFunctionArgs } from "@remix-run/node";

export async function loader(_: DataFunctionArgs) {
  // simulate slow request or DB query
  await new Promise((resolve) => setTimeout(resolve, 300));

  return json({
    articles: [
      { id: "1", title: "Hello World" },
      { id: "2", title: "Hello Remix" },
    ],
  });
}
```

Then, in our component, we can use the data.

```tsx
import { useLoaderData } from "@remix-run/react";

export default function Component() {
  return (
    <>
      <Time />
      <ul>
        {loaderData.articles.map((article) => {
          return <li key={article.id}>{article.title}</li>;
        })}
      </ul>
    </>
  );
}
```

Now, the HTML will come with the articles already rendered, and if we open the page in a new tab, it will receive the HTML immediately without waiting.

But after we do a new build and the version change, it will wait until the browser cache expires to get the new HTML.
