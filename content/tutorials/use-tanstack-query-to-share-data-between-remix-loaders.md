#@tanstack/query-core@4.29.11 #@remix-run/node@1.16.1 #@remix-run/express@1.16.1

# Use TANStack Query to share data between Remix loaders

Let's say you have two routes that match the same URL, e.g. `app/root` and `app/routes/_index`, now let's say you need to get the same data on both routes.

The traditional way is that you get the data on both loaders, even if that means you fetch it two times.

```ts
import { z } from "zod";

export const TodoSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
});

export async function fetchTodos() {
  let response = await fetch(
    "https://jsonplaceholder.typicode.com/todos"
  );

  return TodoSchema
    .array()
    .promise()
    .parse(response.json());
}
```

But we could do something better, we can implement an in-memory server-side cache to share data.

```ts
import { cache } from "~/cache.server"

export async function fetchTodos() {
  if (cache.has("todos")) return cache.get("todos")
  let response = await fetch(
    "https://jsonplaceholder.typicode.com/todos"
  );

  let todos = await TodoSchema
    .array()
    .promise()
    .parse(response.json());

  cache.put("todos", todos)

  return cache;
}
```

The problem is that if the two loaders trigger `fetchTodos` at the same time both will get `cache.has("todos")` as `false`.

So we also need a way to batch and dedupe requests.

**Enters TANStack Query.**

This library has a QueryClient object that can cache the data of the queries for us, and if the same query is executed twice it will only run it once.

And a great thing about that library is that like there's a React version there's also `@tanstack/query-core` which is framework agnostic, so we can use it fully server-side without using the React hooks.

## Setup (in Express)

We can create the QueryClient instance once in our Express server.js and pass it to our Remix app using `getLoadContext`.

> **Note**: For other HTTP server adapters the idea is the same, but you will need to adapt the code a little bit.

Let's start by creating a `server/query.js` file:

```js
const { QueryClient } = require("@tanstack/query-core")

module.exports = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
    }
  }
})
```

Now, let's go to our `server.js` and change the `createRequestHandler` function to pass `getLoadContext`.

```js
app.all(
  "*",
  (req, res, next) => {
    if (process.env.NODE_ENV === "development") purgeRequireCache();

    return createRequestHandler({
      build: require(BUILD_DIR),
      mode: process.env.NODE_ENV,
      // we need to add this function
      getLoadContext() {
        return { queryClient: createQueryClient(), };
      }
    })(req, res, next);
  }
);
```

Now, let's type `AppLoadContext` to let TS know it has the `queryClient`. We can do this in the `remix.env.d.ts` file.

```ts
/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

import type { QueryClient } from "@tanstack/query-core";

declare module "@remix-run/node" {
  interface AppLoadContext {
    queryClient: QueryClient;
  }
}
```

Finally, we can go to our routes and use `context.queryClient.fetchQuery` to run our `fetchTodos` function.

```ts
export async function loader({ context: { queryClient } }: DataFunctionArgs) {
  let todos = await queryClient.fetchQuery(["todos"], fetchTodos);
  return json({ todos });
}
```

With this, as long as the `queryKey` is the same all the time TANStack Query will take care of only running the `queryFn` once per request.
