#@remix-run/react@2.0.1

# Access loaders data in Remix

If you're using Remix, you may have noticed that the loader data is not passed to the components as props. This is because the loader data stored by Remix in an internal context which allows you to access it in any component and not just the route component itself.

By doing this Remix gives you the power to avoid prop drilling in many cases, but also opens the door to a possible issue, what happens if your component A calls `useLoaderData` but it's used in two routes?

The hook will give you access to the route's loader data, this means if you have two routes, let's say `routes/dashboard` and `routes/_index` and both render the same component depending which renders the component is what the hook will return.

If `routes/dashboard` renders our component, then the hook will gives you `routes/dashboard` loader's data.

If `routes/_index` renders our component, then the hook will gives you `routes/_index` loader's data.

If both have a similar shape, then you may not notice the difference, but if they have different shapes, then you may get an error.

This is why I have started to use the following rules:

## Route Component

For the component of the route (the one you export default) I use `useLoaderData` directly, there's no risk here since the loader and the component are on the same file.

```ts
// app/routes/dashboard.tsx
export async function loader() {
  let data = await getData();
  return json(data);
}

export default function Component() {
  let loaderData = useLoaderData<typeof loader>(); // this is safe
  // more code
}
```

## Components in the Route file

For other components in the same file of the route I also use `useLoaderData` to get the loader's data.

```ts
// app/routes/dashboard.tsx
export async function loader() {
  let data = await getData();
  return json(data);
}

export default function Component() {
  /* code here */
}

function SomethingElse() {
  let loaderData = useLoaderData<typeof loader>();
  // more code
}
```

This is also safe because we know our component is not exported so only our route component, or other components inside this file, can render it.

## Components in the Route folder

If you're using the Remix v2 file system convention, you can change your route files to be folders with a `route.tsx` file inside, this allows for co-location of other files.

```diff
- routes/dashboard.tsx
+ routes/dashboard/route.tsx
```

So now we can move our component to a separate file `routes/dashboard/something-else.tsx`. Here I also use `useLoaderData`.

```ts
// app/routes/dashboard/something-else.tsx
import { type loader } from "./route";

export function SomethingElse() {
  let loaderData = useLoaderData<typeof loader>();
  // more code
}
```

While this component could be imported by other routes, I consider this file local to the route and avoid importing it, if I eventually need it somewhere else I will move it to a shared folder like `app/components` and stop using `useLoaderData`.

## Shared Components

For components outside the route (e.g. in `app/components``) I use props to pass any loader data.

```ts
// app/components/something-else.tsx
type SomethingElseProps = {
  /* define props here */
};

export function SomethingElse(props: SomethingElseProps) {
  // more code
}
```

Here I define exactly the props I need so I don't infer from the loaders or even the DB or API responses, this way I can change the loader or the API and my component won't break.

```ts
// app/routes/dashboard/route.tsx
export async function loader() {
  let data = await getData();
  return json(data);
}

export default function Component() {
  let loaderData = useLoaderData<typeof loader>();
  return <SomethingElse /* pass props here */ />;
}
```

If I ever change what `loaderData` looks like I can just adjust the props I pass to my component without having to change the component itself.

## Child Routes accessing Parent Routes

Sometimes you want to access some value returned by a parent route, for example, if you have a dashboard with a list of items and you want to show the details of one of those items in a separate route.

In that case you have four possible options.

1. Create a custom context to pass the values
2. Use Outlet context to pass the values
3. Use `useRouteLoaderData` to access the parent route data
4. Use `useMatches` to find the parent route data

I personally use `useRouteLoaderData` because it's the easiest to use.

```ts
// app/routes/dashboard.users.tsx
import { type loader as dashboardLoader } from "~/routes/dashboard/route";

export async function loader() {
  let data = await getData();
  return json(data);
}

export default function Component() {
  let loaderData = useLoaderData<typeof loader>(); // this is safe
  let dashboardLoaderData =
    useRouteLoaderData<typeof dashboardLoader>("routes/dashboard"); // kinda safe
  // more code
}
```

While not totally safe because we're depending on the parent route to always be the same, it's unlikely that we will change the parent route, and if we do, we will also change the child route code.

## Parent Routes accessing Child Routes

Remix allows you to access the child route data from the parent route, here we can't use a custom context or the Outlet context, but we can still use `useRouteLoaderData` and `useMatches`.

So the first instinct would be to just reach `useRouteLoaderData` and call it a day, but this is not totally safe, because we don't know which child route will be rendered, what happens if we run this:

```ts
useRouteLoaderData<typeof dashboardUserLoader>("routes/dashboard.user");
```

But we're rendering `routes/dashboard.articles`? We will get an `undefined` value on runtime. So now we need to add `| undefined` to our generic.

And what happens if we want to access the loader data of whatever child is rendered? If we use `useRouteLoaderData` we will have to add one call per child route.

Instead we can use `useMatches` and find the child route that matches our pattern, this way we can get the loader data of whatever child is rendered.

```ts
// app/routes/dashboard.tsx
export async function loader() {
  let data = await getData();
  return json(data);
}

export default function Component() {
  let loaderData = useLoaderData<typeof loader>();

  let childMatch = useMatches().at(-1);
}
```

Now `childMatch` will give me the last match, you can adjust that to use `Array#find` or `-2` or another way to grab it, the idea is that you find the correct child route. Once you have the match object you can do `match.data` to get the route's loader data. I recommend here to do some runtime validation to ensure the data you need is there.

```ts
if (!match.data) throw new Error("No data found"); // or handle it somehow
if (!("something" in match.data)) throw new Error("Missing something"); // also handle it somehow
// probably more validation to narrow the type
// and use match.data.something at the end
```

## Child Routes accessing Parent Routes States

Finally, if you want to pass some state from a parent route to a child route, I would use Outlet context to do so.

```tsx
// app/routes/dashboard.tsx
export async function loader() {
  let data = await getData();
  return json(data);
}

export default function Component() {
  let loaderData = useLoaderData<typeof loader>();
  let [state, setState] = useState<StateType>(initialValue);

  return (
    <Outlet context={state} />
  );
}

// app/routes/dashboard.user.tsx
export default function Component() {
  let loaderData = useLoaderData<typeof loader>();
  let state = useOutletContext<StateType>(); 
  // more code
}
```

So I only use Outlet context to pass values that didn't come from a loader, like this state or even a callback.
