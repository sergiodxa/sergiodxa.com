#@remix-run/cloudflare@1.15.0

# Measure performance with the Server-Timing header in Remix

The Server-Timing header lets you add performance measurements to your response headers so you can later inspect them from the client (e.g. the browser).

If you see some of your routes have slow response times you may want to find out what's happening, and while adding a few `console.time` may work great locally it may not be that useful on production, specially if you have many users consuming your app at the same time and your logs will mix with other users logs.

So let's see a quick example of how you can use this header.

```ts
export async function loader() {
  let start = performance.now();
  let result = await fetchSlowData();
  let duration = performance.now() - start;
  return json(result, {
    headers: { "Server-Timing": `slowThing;dur=${duration}` }
  });
}
```

Now your loader response will include this header with the time it took it to fetch the slow data.

But doing this manually is a lot of work, also if you return this from the loader you will need to export a `headers` function on your routes to add it to the document response, and if you have nested routes you will need to merge these headers from parent routes to don't lose them.

You can read more about all the things you need to do on [Jacob Paris's article about this topic](https://www.jacobparis.com/guides/remix-server-timing) which inspired this tutorial, so go read it and then came back.

---

Now that you're back here, let's improve that approach by using `getLoadContext` to pass the `time` function.

So first we're going to need a way to measure the performance, so let's create a simple class we can instantiate on every request.

```ts
export class Measurer {
	#measures = new Set<{
		name: string;
		duration: number;
	}>();

	async time<Result>(name: string, fn: () => Promise<Result>): Promise<Result> {
		let start = Date.now();
		try {
			return await fn();
		} finally {
			let duration = Date.now() - start;
			this.#measures.add({ name, duration });
		}
	}

	async toHeaders(headers = new Headers()) {
		for (let { name, duration } of this.#measures) {
			headers.append("Server-Timing", `${name};dur=${duration}`);
		}
		return headers;
	}
}
```

This class has a Set where we record our measures, and a `time` method similar to Jacob's one. Then a `toHeaders` method let us add the measures to the headers.

Now, we're going to change our HTTP server code, in my case I'm adding this to my own blog and I used this:

```ts
export async function onRequest(context: EventContext<any, any, any>) {
	let measurer = new Measurer();
	let response = await handleRequest(measurer)(context);
	measurer.toHeaders(response.headers);
	return response;
}
```

So on every request I create a new Measurer instance, then I call my `handleRequest` with that measurer and the result (the actual `handleRequest`) with the Cloudflare event context, finally I call `measurer.toHeaders` with the `response.headers` to attache them.

This is a simplified version of my `handleRequest` function:

```ts
function handleRequest(measurer: Measurer) {
	return createPagesFunctionHandler({
		build,
		mode: process.env.NODE_ENV,
		getLoadContext(context): AppLoadContext {
			// my code for getLoadContext
			return { time: measurer.time.bind(measurer), ...otherThings };
		},
	});
}
```

I add `time` to my `AppLoadContext` type:

```ts
declare module "@remix-run/server-runtime" {
	export interface AppLoadContext {
		// ...other things here
		time: Measurer["time"];
	}
}
```

And now I can use `context.time` to measure my loaders performance:

```ts
export function loader({ request, context }: LoaderArgs) {
	return context.time("routes/index#loader", async () => {
		// code here
	});
}
```

And if you open the browser DevTool right now and reload the page you will be able to see the Server-Timing header attached to the response, I do a single measure for the whole loader, but I should do more granular ones and have better metrics.
