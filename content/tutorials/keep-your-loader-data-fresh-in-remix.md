#@remix-run/react@2.0.0 #react@18.0.0

# Keep Your Loader Data Fresh in Remix

Using the useRevalidator hook we can revalidate our loader data on an interval to ensure that our data is always fresh.

How fresh can depends on the interval speed, but we could set it to one second to ensure any changes are reflected in our UI as soon as possible.

```ts
import { useLoaderData, useRevalidator } from "@remix-run/react";

// Your loader function and does something
export async function loader() {
  // code here
}

export default function Component() {
  let loaderData = useLoaderData<typeof loader>();
  let { revalidate } = useRevalidator();

  useEffect(() => {
    let id = setInterval(revalidate, 1000);
    return () => clearInterval(id);
  }, [revalidate]);

  // use loaderData here for your UI
}
```

With this effect, our code will revalidate the loader data every second and our loader data will be updated.

## Handle Lack of Internet Connection

What happens if the user goes offline? In that case the revalidation will fail and our app will go to the ErrorBoundary, we can avoid this by detecting if the user is offline and avoid triggering the revalidation.

```ts
let onlineStatus = useSyncExternalStore(
  (callback) => {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
      window.removeEventListener("online", callback);
      window.removeEventListener("offline", callback);
    };
  },
  () => navigator.onLine,
  () => true,
);
```

With this code, `onlineStatus` will start as true (the user is online) and then a new value will be read when the online or offline events are triggered.

We can now update our effect to consider the `onlineStatus`.

```ts
useEffect(() => {
  if (!onlineStatus) return;
  let id = setInterval(revalidate, 1000);
  return () => clearInterval(id);
}, [onlineStatus, revalidate]);
```

Now if `onlineStatus` is false (the user is offline) we never start our interval, because the effect depends on the `onlineStatus` value the cleanup function where we cancel the interval will run if the user goes offline and the effect will run again once is back online so the interval can start again.

## Stop When the App Is Inactive

The user may leave our app open in a tab and go to another tab or application, in that case we don't need to keep revalidating our data because the user is not looking at our app, so we can save both user bandwidth and server resources by detecting when the visibility state change and stop our interval.

```ts
let visibilityState = useSyncExternalStore(
  (callback) => {
    document.addEventListener("visibilitychange", callback);
    return () => document.removeEventListener("visibilitychange", callback);
  },
  () => document.visibilityState,
  () => "visible" as const,
);

useEffect(() => {
  if (visibilityState === "hidden") return;
  if (!onlineStatus) return;
  let id = setInterval(revalidate, 1000);
  return () => clearInterval(id);
}, [visibilityState, onlineStatus, revalidate]);
```

Here we added another check, if the `visibilityState` is hidden the interval will be cleared and a new one will not be started, but if the `visibilityState` is visible the effect will run again and the interval will be started again. All of this combined with our check for `onlineStatus` will ensure that we only revalidate when the user is online and looking at our app.

## Connection Status and Interval Speed

In some browsers, we can use the [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API) to detect the connection speed, and use that to adjust the interval speed, this way we can revalidate more often when the user is on a fast connection and less often when the user is on a slow connection.

```ts
let connectionSpeed = useSyncExternalStore(
  (callback) => {
    let connection = navigator.connection;
    if (!connection) return () => {};
    connection.addEventListener("change", callback);
    return () => connection.removeEventListener("change", callback);
  },
  () => {
    let connection = navigator.connection;
    if (!connection) return "4g";
    return connection.effectiveType;
  },
  () => "4g",
);

useEffect(() => {
  if (visibilityState === "hidden") return;
  if (!onlineStatus) return;
  let id = setInterval(revalidate, connectionSpeed === "4g" ? 1000 : 5000);
  return () => clearInterval(id);
}, [visibilityState, onlineStatus, revalidate, connectionSpeed]);
```

Now, if the browser supports this API, we can detect the [connection effective type](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType), then if it's 4g we can revalidate every second, but if it's 3g or slower we can revalidate every 5 seconds.

## Avoid Revalidation on save Data Mode

Some browsers have a [save data mode](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData) that the user can enable to ask the websites to reduce the data consumption, we could use this to avoid revalidating when the user is on this mode.

We can start detecting it in our loader function.

```ts
export async function loader({ request }: LoaderFunctionArgs) {
  // maybe some code here
  let connection = request.headers.get("save-data");
  let saveData = request.headers.get("save-data") === "on";
  // more code here
  return json({ saveData });
}
```

Then we can use another `useSyncExternalStore` to read the value from the browser Network Information API so we can start the revalidation if the user disabled the Save-Data mode.

```ts
let saveData = useSyncExternalStore(
  (callback) => {
    let connection = navigator.connection;
    if (!connection) return () => {};
    connection.addEventListener("change", callback);
    return () => connection.removeEventListener("change", callback);
  },
  () => {
    let connection = navigator.connection;
    if (!connection) return false;
    return connection.saveData;
  },
  // Here we use the loaderData as the default value
  () => loaderData.saveData,
);
```

And finally update our effect to use this value too.

```ts
useEffect(() => {
  if (saveData) return;
  if (visibilityState === "hidden") return;
  if (!onlineStatus) return;
  let id = setInterval(revalidate, connectionSpeed === "4g" ? 1000 : 5000);
  return () => clearInterval(id);
}, [saveData, visibilityState, onlineStatus, revalidate, connectionSpeed]);
```

With this, our interval will never start until the user disables the Save-Data mode.
