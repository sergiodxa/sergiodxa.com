#@remix-run/server-runtime@1.6.8 #@remix-run/node@1.6.8 #@remix-run/cloudflare@1.6.8

# Customize Remix `AppLoadContext` type

If you're using the `getLoadContext` function in your HTTP servers to pass data to your Remix app, you may notice that the `context` object is missing the properties you're setting.

For example, if you do the following:

```ts
createRequestHandler({
  build: require("./build"),
  mode: process.env.NODE_ENV,
  getLoadContext(request) {
    return { name: "World" };
  },
});
```

And then, in your Remix loaders or actions, try to access `name`.

```tsx
export async function loader({ context: { name } }: DataFunctionArgs) {
  // code here
}
```

You will notice that `name` is not typed correctly.

To fix that, you must overwrite the `AppLoadContext` type that Remix defines to what your `getLoadContext` sets.

```ts
declare module "@remix-run/server-runtime" {
  export interface AppLoadContext {
    name: string;
  }
}
```

Put that TS code in a file your app imports, for example, in `remix.env.d.ts`, and now the type of `name` will be the expected one.
