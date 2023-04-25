#@remix-run/node@1.12.0 #@remix-run/cloudflare@1.12.0 #@remix-run/deno@1.12.0

# Delete a Cookie using Remix cookie helpers

If we have set a cookie and we need to tell the browser to delete it, we can do that with a simple trick, we can set the cookie value to an empty string and set the expiration date to the past.

```ts
import { cookie } from "~/cookie";

export async function action() {
  return json(data, {
    headers: {
      "Set-Cookie": await cookie.serialize("", {
        expires: new Date(0),
      }),
    },
  });
}
```

## Delete all cookies using `Clear-Site-Data` header

There's also an HTTP header called `Clear-Site-Data` that can be used to delete all cookies, and other site data, at once. This header [is not yet supported by all browser](https://caniuse.com/mdn-http_headers_clear-site-data_cache), at the moment of writing this only Chromium-based browsers support it, so Safari and Firefox don't.

However, once support becomes more widespread, this is a great way to delete all cookies at once.

```ts
export async function action() {
  return json(data, {
    headers: {
      "Clear-Site-Data": "cookies"
    },
  });
}
```

That's it, now all your site cookies will be cleared by the browser, remember this clears **all cookies**, if you need to delete a specific cookie, use the `Set-Cookie` header as shown above.
