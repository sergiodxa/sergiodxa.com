#remix-utils@6.3.0

# Close SSE connection from the server in Remix

If you're using SSE in a Remix app, you may find you want to be able to close the connection from the server.

The [Remix Utils `eventStream` function](https://github.com/sergiodxa/remix-utils#server-sent-events) expects an AbortSignal instance as first argument, the reason for this is to let the stream be closed once the request is aborted, when the connection is closed from the browser side.

But we could create a custom AbortSignal instance by using AbortController and close it manually.

Let's say we have this `/sse/time` route to get the current time from the server every second.

```ts
// app/routes/sse.time.ts
import { eventStream } from "remix-utils";

export async function loader({ request }: DataFunctionArgs) {
  return eventStream(request.signal, function setup(send) {
    let timer = setInterval(() => {
      send({ event: "time", data: new Date().toISOString() });
    }, 1000);

    return function clear() {
      clearInterval(timer);
    };
  });
}
```

Imagine we want to limit it that, after 10 seconds has passed, we want to stop sending events to the browser.

We could update it this way:

```ts
// app/routes/sse.time.ts
import { eventStream } from "remix-utils";

export async function loader({ request }: DataFunctionArgs) {
  let controller = new AbortController();

  request.signal.addEventListener("abort", () => controller.abort());

  let start = Date.now();

  return eventStream(controller.signal, function setup(send) {
    let timer = setInterval(() => {
      let date = new Date();
      if (date.getTime() - start > 10000) return controller.abort();
      send({ event: "time", data: new Date().toISOString() });
    }, 1000);

    return function clear() {
      clearInterval(timer);
    };
  });
}
```

What the loader is doing now is to instantiate `AbortController`, then attach an event listener to the `request.signal` (not the `controller.signal`) so when the connection is closed we abort the signal from the controller.

In the line where we used to pass `request.signal` we now pass `controller.signal`.

Then we have our logic, save the start date when the connection is opened, and on each interval we get the current time and if 10 seconds has passed we call `controller.abort()`.

Something important is that we need to return here so our `send` call is not executed, otherwise we will try to keep sending values to the browser and our app will crash because the stream is already closed.

Finally, because the signal is aborted, the stream will be closed, our cleanup callback will be executed and our interval will be cleared.

And with this, we where able to close the connection purely from the server instead of waiting of the browser to close it.
