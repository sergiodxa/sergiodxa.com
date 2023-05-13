#@remix-run/react@16.0.0

# Send JSON to a Remix action

While [there's a proposal to add support for this](https://github.com/remix-run/remix/discussions/1959#discussioncomment-2205718), right now we have to rely on some "hacks" to make it work.

The way it works is by serializing the JSON to a field you send in your FormData object.

We can do this for different Remix APIs, for example, using `<Form>`:

```tsx
<Form method="post">
  <input
    type="hidden"
    name="json"
    value={JSON.stringify(value)}
  />
</Form>
```

And `value` can come from a state we set somewhere else, probably using a form element not rendering an actual input tag.

We can also use it with the `useSubmit` hook:

```ts
let submit = useSubmit()
// later in an event listener or effect
submit(
  { json: JSON.stringify(value) },
  { method: "post" }
)
```

And both approaches works equally with `<fetcher.Form>` and `fetcher.submit`

```tsx
<fetcher.Form method="post">
  <input
    type="hidden"
    name="json"
    value={JSON.stringify(value)}
  />
</fetcher.Form>
```

```ts
let fetcher = useFetcher()
// later in an event listener or effect
fetcher.submit(
  { json: JSON.stringify(value) },
  { method: "post" }
)
```

Finally, we can get this JSON on our action by reading the body as FormData:

```ts
export async function action({ request }: DataFunctionArgs) {
  let formData = await request.formData()
  let json = JSON.parse(formData.get("json"))
  // use json here, probably use Zod to validate it
}
```

And that's how we can, right now, use JSON to send more complex data structures to the server.

Once support for this is added directly to Remix it may be simpler, personally I expect it to work with `useSubmit` and `fetcher.submit` only so both `<Form>` and `<fetcher.Form>` keeps working with PE in mind.
