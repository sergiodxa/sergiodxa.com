#@remix-run/node@2.0.0 #@remix-run/cloudflare@2.0.0 #@remix-run/deno@2.0.0 #@remix-run/react@2.0.0

# Access the Search Params of a Request in Remix

The search params, typically called query params, are the part of the URL that comes after the `?`. For example, in the URL `https://sergiodxa.com/tutorials?q=remix`, the search params part of the URL is `q=remix`.

This is commonly used to pass data to the server using the URL, for example when building a search form you can pass the search term or any other filter. Or when building a pagination you can pass the page number and page size, or a cursor.

If you're writing a Remix route that receives a request with search params you can access them using the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) and [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) APIs.

```ts
export async function loader({ request }: LoaderFunctionArgs) {
  let { searchParams } = new URL(request.url);
  let query = searchParams.get("query");
  let products = await getProducts(query)
  return json({ query, products });
};
```

In some cases the search param can be duplicated, one example can be if you're building a filter with checkboxes and you want to allow multiple values for the same filter. In that case you can use the `getAll` method to get all the values for a search param.

```ts
export async function loader({ request }: LoaderFunctionArgs) {
  let { searchParams } = new URL(request.url);
  let size = searchParams.getAll("size");
  let products = await getProducts({ size })
  return json({ query, products });
};
```

Another common use case is to get the search params from the client, for example if you're building a search form you can get the search term from the client and pass it to the server.

```tsx
import { useSearchParams } from "@remix-run/react";
import { useDeferredValue, useEffect, useState } from "react";

export function Component() {
  let [searchParams, setSearchParams] = useSearchParams();
  let [value, setValue] = useState(() => {
    return searchParams.get("query") ?? ""
  });

  let deferredValue = useDeferredValue(value);

  useEffect(() => {
    setSearchParams({ query: deferredValue });
  }, [deferredValue, setSearchParams]);

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
    />
  );
}
```
