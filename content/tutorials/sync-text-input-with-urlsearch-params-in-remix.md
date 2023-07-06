#react@18.2.0 #@remix-run/react@1.18.1

# Sync text input with URLSearchParam in Remix

Let's say we're building a search form that needs to keep the value on the search params as the user type.

We could directly update on the onChange event and set `<input value>` to be `searchParams.get("query")`, but this could cause the UI to start to lag as the user type and the URL is changed on every keystroke.

Here's where the `useDeferredValue` from React 18 comes handy.

We can keep the current input value in a state and make the `<input value>` use the state so it gets the new value immediately.

Then using useDeferredValue we can run an effect to sync it back to the search params.

```ts
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

By doing this, the user can type freely on the input without any lag, and the search params will update eventually with the latest value.

In Remix this will also cause loaders to re-run which means if we're on a `/search` route the loader will receive the new query and return the new data once the search params change.
