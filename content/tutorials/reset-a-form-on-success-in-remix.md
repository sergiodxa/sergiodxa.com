#@remix-run/react@16.0.0

# Reset a form on success in Remix

If you have a form with one or more uncontrolled inputs you may have seen the case where the user submits the form but the inputs are not cleared.

This happens when you don't redirect the user somewhere else, and it's because React is not re-mounting the inputs.

You can use a combination of `useActionData` and `useNavigation` with a `useEffect` and a ref to reset it.

```ts
let $form = useRef<HTMLFormElement>(null)
let navigation = useNavigation()
let actionData = useActionData<typeof action>()

useEffect(function resetFormOnSuccess() {
  if (navigation.state === "idle" && actionData?.ok) {
    $form.current?.reset()
  }
}, [navigation.state, actionData])

return (
  <Form method="post" ref={$form}>
    // place many inputs inside this Form
  </Form>
)
```

This way, once the `navigation.state` changes to `idle` and `actionData` has a way to identify it was a success (in our case we have `ok === true` but it could be a literal like `status === "success"`) we can tell our form to reset itself.

If we're using `fetcher.Form` instead of `Form` we can do a similar thing with `fetcher.state` and `fetcher.data`.

```ts
let $form = useRef<HTMLFormElement>(null)
let fetcher = useFetcher<typeof action>()

useEffect(function resetFormOnSuccess() {
  if (fetcher.state === "idle" && fetcher.data?.ok) {
    $form.current?.reset()
  }
}, [fetcher.state, fetcher.data])

return (
  <fetcher.Form method="post" ref={$form}>
    // place many inputs inside this Form
  </fetcher.Form>
)
```
