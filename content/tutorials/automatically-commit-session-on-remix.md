#@remix-run/express@1.15.0 #@remix-run/cloudflare-pages@1.15.0 #@remix-run/dev@1.15.0

# Automatically commit sessions on Remix

When you use Remix's session feature you have to always remember to commit your session before sending the response.

This is a simpler function you call in your loader or actions:

```ts
return json(data, {
  headers: {
    "Set-Cookie": await sessionStorage.commitSession(session),
  },
});
```

If you only change it on an `action` function it's not an issue because only one action runs at the same time. However if you change it on a `loader` function you might have concurrency issues.

If two or more loaders commit the same session only the last to resolve will be the one that is committed. To avoid this we can ensure the session is committed only once.

We will have to move the session creation to the HTTP server, outside our Remix app.

> **Note**: If you use Remix App Server, you will have to switch to the Express adapter, you can use `npx rmx-cli eject-ras` for that.

## Pass Session from Server to Remix

Let's say we use Express, we will have an Express middleware like this one:

```js
app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? (req, res, next) => {
        purgeRequireCache();

        return createRequestHandler({
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV,
        })(req, res, next);
      }
    : createRequestHandler({
        build: require(BUILD_DIR),
        mode: process.env.NODE_ENV,
      })
);
```

Let's simplify this a bit:

```js
app.all("*", (req, res, next) => {
  if (process.env.NODE_ENV === "development") purgeRequireCache();
  return createRequestHandler({
    build: require(BUILD_DIR),
    mode: process.env.NODE_ENV,
  })(req, res, next);
});
```

We can now get the session before calling `createRequestHandler`.

```js
app.all("*", async (req, res, next) => {
  if (process.env.NODE_ENV === "development") purgeRequireCache();

  let session = await sessionStorage.getSession(req.headers.cookie);

  return createRequestHandler({
    build: require(BUILD_DIR),
    mode: process.env.NODE_ENV,
  })(req, res, next);
});
```

Now that we have that session, we need to pass it to Remix, to do so we can use the [`getLoadContext` function](https://remix.run/docs/en/1.15.0/route/loader#context).

```js
app.all("*", async (req, res, next) => {
  if (process.env.NODE_ENV === "development") purgeRequireCache();

  let session = await sessionStorage.getSession(req.headers.cookie);

  return createRequestHandler({
    build: require(BUILD_DIR),
    mode: process.env.NODE_ENV,
    getLoadContext() {
      return { session };
    },
  })(req, res, next);
});
```

> **Note**: If you're using TypeScript, you may want to [customize AppLoadContext type](https://sergiodxa.com/tutorials/customize-remix-app-load-context-type) to add `session: Session` so doing `context.session` is typed.

## Use the Session in Remix

Now that we have the session in the context, we can use it in our loaders.

```ts
export async function loader({ context: { session } }: DataFunctionArgs) {
  let value = session.get("key");
  session.set("key2", "value 2");
  return json({ value });
}
```

Or in our actions.

```ts
export async function action({ context: { session } }: DataFunctionArgs) {
  session.flash("key", "value 1");
  return redirect("/somewhere");
}
```

## Commit the Session

Let's go back to the HTTP server, we have to after the response is ready commit the session.

Because Remix's Express adapter automatically sends the response for us, and we can't set headers to an already sent response, we have to change the `createRequestHandler` to customize that in the adapter.

```ts
export function createRequestHandler({
  build,
  getLoadContext,
  mode = process.env.NODE_ENV,
}: {
  build: ServerBuild;
  getLoadContext?: GetLoadContextFunction;
  mode?: string;
}): RequestHandler {
  let handleRequest = createRemixRequestHandler(build, mode);

  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      let request = createRemixRequest(req, res);
      let loadContext = getLoadContext?.(req, res);

      let response = (await handleRequest(
        request,
        loadContext
      )) as NodeResponse;

      // custom part

      // use append in case your code sets a cookie
      response.headers.append(
        "Set-Cookie",
        // we have to access our sessionStorage somehow, this is up to you
        await sessionStorage.commitSession(loadContext.session)
      );

      // ends custom part

      await sendRemixResponse(res, response);
    } catch (error: unknown) {
      // Express doesn't support async functions, so we have to pass along the
      // error manually using next().
      next(error);
    }
  };
}
```

And now we can use it in our server:

```js
app.all("*", async (req, res, next) => {
  if (process.env.NODE_ENV === "development") purgeRequireCache();

  let session = await sessionStorage.getSession(req.headers.cookie);

  return createRequestHandler({
    // this is the custom function we created
    build: require(BUILD_DIR),
    mode: process.env.NODE_ENV,
    getLoadContext() {
      return { session };
    },
    sessionStorage,
  })(req, res, next);
});
```

> **Note**: The `createRemixRequestHandler`, `createRemixRequest`, `handleRequest` and `sendRemixResponse` are all exported from `@remix-run/express/dist/server`.

And that's it, now every request, both a documen request and a data request, will have access to a session object that it's automatically committed.

Something to highlight is that on data requests you can still have race conditions on loaders, if Remix fetches two or more loaders at the same time, the session will be committed once per request, so you have to be careful with that, only the last one received by the browser will remain in the session.

## How to do it with other Remix adapters

If you are not using Express (or Remix App Server), your server code will be different, nevertheless the idea is the same, you have to get the session before calling the Remix request handler, and commit the session after the response is ready.

This is how you could do it with Cloudflare Pages:

```js
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

export async function onRequest(context) {
  context.request.headers.get("Cookie");

  let session = await sessionStorage.getSession(
    context.request.headers.get("Cookie")
  );

  let handleRequest = createPagesFunctionHandler({
    build,
    mode: process.env.NODE_ENV,
    getLoadContext(context) {
      return { env: context.env, session };
    },
  });

  let response = await handleRequest(context);

  response.headers.append(
    "Set-Cookie",
    await sessionStorage.commitSession(session)
  );

  return response;
}
```

For other adapters check when and how they send the Response your Remix app gives them, and commit the session after that.
