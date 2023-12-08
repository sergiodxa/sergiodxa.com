#@remix-run/react@2.0.0

# Prefetch data for Remix Fetcher usage

If you're using Remix, you can ask it to prefetch the data of a new route using `<Link prefetch`> prop, but if you need to use `fetcher.load` or `fetcher.submit` to load some data, you can't use the Link.

To be able to prefetch them you can do the same thing Link component does, render a `<PrefetchPageLinks>` component.

```tsx
let fetcher = useFetcher<typeof resourceLoader>();

return (
  <>
    <PrefetchPageLinks page="/resource" />
    <button type="button" onClick={() => fetcher.load("/resource")}>
      Load Data
    </button>
    {fetcher.data && <DisplayData data={fetcher.data} />}
  </>
);
```

Now when the HTML tag is rendered it will start prefetching the data, and once the user finally clicks the link it will be ready.

If you want to see a demo app, here's the code [sergiodxa/remix-demo-prefetch-fetcher](https://github.com/sergiodxa/remix-demo-prefetch-fetcher).
