---
title: Progressively enhance the useFetcher hook in Remix
createdAt: Fri Jan 20 2023 03:30:08 GMT-0500 (Peru Standard Time)
updatedAt: Fri Jan 20 2023 03:30:08 GMT-0500 (Peru Standard Time)
technologies: []
questions: []
---

If you're using multiple forms on the same route, you may use the useFetcher hook, which also gives you a Form component.

This component works the same way as the global Form from Remix but uses the fetcher, which allows you to render one Form per item in a list and have each one keep its result.

But what happens if you want to support no-JS users? The fetcher.Form will still work because it renders an actual `<form>` tag, but our action will most likely return a `json` response which the user will not know how to use.

So we need to return a redirect from the action instead. But now our list will not work as before.

There's a way thought to support both scenarios. By adding a hidden input, we can let the server know whether the user has JS enabled.

```tsx
import { useHydrated } from "remix-utils";
import { useFetcher } from "@remix-run/action";

function Route() {
  let fetcher = useFetcher();
  let isHydrated = useHydrated();

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="no-js" value={String(!isHydrated)} />
      <button type="submit">Submit</button>
    </fetcher.Form>
  );
}
```

Now, our form data will travel with a `no-js=true` or `no-js=false`. The value will change after the app is hydrated, meaning our useFetcher is working correctly and not just when the user has JS enabled.

Finally, in our actions, we need to handle this.

```ts
import type { ActionArgs } from "@remix-run/node";
import { redirectBack } from "remix-utils";
import { z } from "zod";

export async function action({ request }: ActionArgs) {
  let formData = await request.formData();

  // you can replace Zod with any other validation library, or your checks
  let noJS = z
    // convert "true" to boolean, treat any other value as false
    .preprocess((v) => v === "true", z.boolean())
    .nullable() // allow it to be null
    .default(true) // default to true (support the worst scenario)
    .parse(formData.get("no-js")); // read from formData

  let result = await doSomething();

  if (noJS) {
    let session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );
    // save anything you want to send to the user with session.flash
    session.flash("someKey", result);
    // redirect the user where it was before
    return redirectBack(request, {
      // provide a fallback if it's not possible to detect where the user was
      fallback: "/where/the/user/may/have/been/before",
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  }

  // return your
  return json(result, { status: 201 });
}
```

By doing this, we can still support no-JS users on our app and provide an improved experience for most users with JS.
