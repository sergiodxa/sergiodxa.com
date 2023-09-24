#@remix-run/node@2.0.0

# Abort async calls inside Remix loaders and actions

Let's say you're writing a loader that needs to do Fetch call to get some data, something simple just for the example:

```ts
import { json } from "@remix-run/node"

export async function loader() {
  let response = await fetch("https://jsonplaceholder.typicode.com/todos")
  return json(await response.json())
}
```

Now let's imagine the user clicks a `<Link>` to this route, so Remix fetches the loader data before doing the navigation, but if the user clicks a `<Link>` to another route before our loaders sends a response, it will send a signal to abort the request which will basically ignore the response.

However, because the way our loaders works, since we already received the request we will still execute the loader completely and generate a response.

Instead of this, we can do something better, we can know when the browser aborted the request and stop executing our, we can even abort our own fetch calls!

```ts
import {
  json,
  type LoaderFunctionArgs
} from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  let response = await fetch("https://jsonplaceholder.typicode.com/todos", {
    signal: request.signal
  })
  return json(await response.json())
}
```

The `request.signal` will become aborted if the browser aborted it, so we can pass the same signal to our fetch calls to get the same result.

If we do multiple fetch calls, we can re-use it too, so every call will be aborted.

```ts
import {
  json,
  type LoaderFunctionArgs
} from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  let [res1, res2] = await Promise.all([
    fetch(url1, { signal: request.signal }),
    fetch(url2, { signal: request.signal }),
  ])
  // more code
}
```

Something to take into account is that an aborted fetch throws an error `AbortError: The operation was aborted.`.

This means that our code after the fetch, or after our `Promise.all`, will not run because this error is thrown. But also means if we handle error in our loader with a try/catch we will need to consider it.

```ts
export async function loader({ request }: LoaderFunctionArgs) {
  try {
  let response = await fetch("https://jsonplaceholder.typicode.com/todos", {
    signal: request.signal
  })
  return json(await response.json())
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      // for aborted errors send a 204 No content response
      return new Response(null, { status: 204 });
    }
    throw error
  }
}
```

This is all great if we only do Fetch calls, but what if we do any other async code?

Well this will depends a lot if the async code supports `AbortSignal`s, but if it doesn't we can always manually check the aborted status.

```ts
if (request.signal.aborted) console.log("aborted!");
```

By using `request.signal.aborted` we will know when this happens, so let's say you're reading a file from the file system, based on the content you read a second file.

```ts
let pkg = await readFile(resolve("./package.json"), "utf-8");

if (request.signal.aborted) {
  let error = new Error("Aborted");
  // this is required to simulate an AbortError, but we can
  // also throw normal Error or a custom Error subclass and
  // then handle it in our try/catch
  error.name = "AbortError";
  throw error;
}

let tsConfig = await readFile(resolve("./tsconfig.json"), "utf-8");
```

If we're working with a database ORM, we can also use DB transactions to let use abort one or more changes we do to our DB if the request was aborted.

```
export async function action({ request }: ActionFunctionArgs) {
  let result = await db.transaction(async trx => {
    // perform and await first query
    if (request.signal.aborted) throw new Error("Aborted")
    // perform and await second query
    if (request.signal.aborted) throw new Error("Aborted")
  })
  return json(result)
}
```

By checking `request.signal.abort` between DB queries we can stop at any moment and the transaction will ensure we don't have half mode changes.

If an ORM supports AbortSignal we could probably simplify this.

```ts
let result = await db.transaction(async trx => {
  // perform and await first query
  // perform and await second query
}, { signal: request.signal });
```

But I'm not aware of any ORM with AbortSignal support right now.

---

Something to take into care, if we abort a POST request to another API and that API doesn't abort database changes, we may still have issues where half of a mutation happened because one half already ran but the other one was aborted.

If we're not sure it's better to just don't use this for actions and limit it to loaders only, this way our loaders can still stop running earlier and our mutations are safely executed.
