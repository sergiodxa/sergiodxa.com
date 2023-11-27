#@remix-run/react@2.0.0 #@remix-run/node@2.0.0

# Expose Remix Routes as API Endpoints

If you're building a Remix web app, and then you decide to expose an API from that app, you may be tempted to try to reuse the same routes of your web as your API.

Maybe you're building a TODOs app, and you have a route to list the current user todos on `/todos`

```ts
// app/routes/todos.ts
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { authenticateWithSession } from "~/auth.server"; // this is a function that will authenticate the user based on the session cookie
import { db } from "~/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  let user = await authenticateWithSession(request);
  let todos = await db.todos.findMany({ where: { userId: user.id } });
  return json({ todos });
}

export default function Component() {
  let { todos } = useLoaderData<typeof loader>();
  // the rest of the code
}
```

Now we want to expose this list of routes as an API. One thing we could do is to use the `?_data` search param to request only the loader data to Remix, for our case the endpoint would be:

```http
GET /todos?_data=routes/todos
```

And while this may work, it relies on an internal behavior of Remix, which [may change for v3](https://github.com/remix-run/remix/discussions/7640), so this should be discarted.

Instead, we can create a new route that will be used only for the API, and reuse the loader function from the web route:

```ts
// app/routes/api.todos.ts
export { loader } from "~/routes/todos";
```

This will also work, but our loader is calling `authenticateWithSession` which expects a Remix session storage to be used and a cookie, and APIs are typically used with the `Authorization` header, also it's coupled to the web app, which means we can't change the loader anymore locking our UI to that data, or if we change the UI and need to change the loader it will be a breaking change for any consumer of the API.

Instead, a better solution is to move the shared business logic to a new function, in a separate file, and then use that function from both routes:

```ts
import { db } from "~/db.server";

// app/todos.server.ts
export async function getTodosForUser(user: User) {
  return await db.todos.findMany({ where: { userId: user.id } });
}
```

Now we can update our UI route to use this function:

```ts
// app/routes/todos.ts
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { authenticateWithSession } from "~/auth.server";
import { getTodosForUser } from "~/todos.server";

export async function loader({ request }: LoaderFunctionArgs) {
  let user = await authenticateWithSession(request);
  let todos = await getTodosForUser(user);
  return json({ todos });
}

export default function Component() {
  let { todos } = useLoaderData<typeof loader>();
  // the rest of the code
}
```

And also re-use it in our API route:

```ts
// app/routes/api.todos.ts
import { json, type LoaderFunctionArgs } from "@remix-run/node";

import { authenticateWithHeader } from "~/auth.server";
import { getTodosForUser } from "~/todos.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // this now uses the Authorization header to authenticate the user
  let user = await authenticateWithHeader(request)
  let todos = await getTodosForUser(user);
  return json({ todos });
}
```
