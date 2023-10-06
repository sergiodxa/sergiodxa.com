#@remix-run/node@2.0.1 #@remix-run/deno@2.0.1 #@remix-run/cloudflare@2.0.1

# Redirect with Search Param in Remix

Let's say you want to ensure a specific search param is always set, to do so you can first check if the search params is set, and if not, redirect to the same route with the search param set.

```ts
export async function loader({ request }: LoaderFunctionArgs) {
  let url = new URL(request.url);

  if (!url.searchParams.has("key")) {
    url.searchParams.set("key", "value");
    throw redirect(url.toString());
  }

  // the rest of your code
}
```

First we create a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) instance, this let us work with the URL more easily.

Then we access the [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) instance with `url.searchParams` and check if it doesn't have our key, if it doesn't we set it with `url.searchParams.set("key", "value")`.

Finally we throw a redirect with the new URL, this will redirect the user to the same route but with the search param set.

If the request URL already has the search param set, the loader will continue to the rest of the code.
