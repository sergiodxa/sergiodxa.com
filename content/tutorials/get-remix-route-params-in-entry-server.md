#@remix-run/node@1.19.3 #@remix-run/cloudflare@1.19.3

## Get Remix route params `entry.server`

If you have a parameter like the locale `/:locale/*` that you want to get in entry.server for any reason, you can use the `EntryContext` object in `handleRequest` to access this information.

```ts
export default async function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  remixContext: EntryContext
) {
  let { locale } = remixContext
    .staticHandlerContext
    .matches
    .at(0)
    .params;
  // use locale here
}
```

This can work with any route parameter, but remember that this file runs for every route, so the parameter may be `undefined`.
