#@remix-run/node@16.0.0

# Send Node.js ReadStream objects from Remix loaders

If you're creating route in Remix that needs to send a file from you may want to use `node:fs` to get the file content from the system and send it, but if you do the following:

```ts
import { createReadStream } from "node:fs";
import { resolve } from "node:path";

export async function loader() {
  let file = createReadStream(resolve("./package.json"));
  return new Response(file, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
```

You will notice that TS will yell `Argument of type 'ReadStream' is not assignable to parameter of type 'BodyInit'`.

This happens because the global `Response` object uses the DOM typings which doesn't know about Node.js ReadStream.

We could solve this by casting the type but a simpler and more type-safe way is to add a single line:

```ts
import { Response } from "@remix-run/node";
```

By importing `Response` from `@remix-run/node` instead of relying on the global we use a Node.js compatible response object that will accept `ReadStream` as possible body.
