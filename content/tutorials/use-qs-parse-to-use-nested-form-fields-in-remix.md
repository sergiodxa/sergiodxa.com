#qs@6.11.2 #@remix-run/react@16.0.0 #@remix-run/server-runtime@16.0.0 #zod@3.21.4

# Use `qs.parse` to use nested form fields in Remix

The traditional way to parse a form body in Remix is by using `request.formData()` to get a new FormData object, then use `formData.get()` or `formData.getAll()` to parse them.

But this limit us to a simpler data structure for our inputs that only supports `string | string[]`.

But this is not necessarily the only way to parse forms. Using the `qs` package we could use arrays, objects and even nest them. Let's see how.

## Name your inputs accordingly

First, we need to create a new form with the inputs using the names we need for `qs` to work.

```tsx
<Form method="post">
  <input type="text" name="user[name]" />
  <input type="email" name="user[email]" />

  <input type="text" name="friends[0] />
  <input type="text" name="friends[1] />

  <input type="text" name="companies[0][name]" />
  <input type="url" name="companies[0][website]" />

  <input type="text" name="companies[1][name]" />
  <input type="url" name="companies[1][website]" />
</Form>
```

## Parse the request to a plain text

Now, in our action, we need to parse the request as a plain text instead of FormData.

```ts
export async function action({ request }: DataFunctionArgs) {
  let body = await request.text()
  //...
}
```

## Parse the body with `qs.parse`

Finally, we can use `qs.parse` to convert that text to a JSON.

```ts
import { parse } from "qs";

export async function action({ request }: DataFunctionArgs) {
  let body = await request.text()
  let json = parse(body)
  //...
}
```

If we do a `console.log(json)` we will see we got a JSON like this:

```ts
{
  user: { name: "John", email: "john@acme.com" },
  friends: ["Jane", "Joe"],
  companies: [
    { name: "Acme 1", website: "https://acme1.com" },
    { name: "Acme 2", website: "https://acme2.com" }
  ]
}
```

## Validating with Zod

Because we must never trust any user input, we could use Zod to parse that resulting JSON against a schema and ensure it matches an expected shape.

```ts
let FormSchema = z.object({
  user: z.object({ name: z.string(), email: z.string().email() }),
  friends: z.string().array(),
  companies: z.object({ name: z.string(), website: z.string().url() }).array()
})
```

Once we have the schema we could use it in our loader.

```ts
import { parse } from "qs";

export async function action({ request }: DataFunctionArgs) {
  let body = await request.text()
  let data = FormSchema.parse(parse(body))
  //...
}
```

With that, we can ensure `data` conforms to our expected schema and also TS will be happy.
