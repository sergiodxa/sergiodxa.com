#globby@13.2.2 #node@16.13.0 #@remix-run/react@1.18.1

# Strongly type Remix route IDs

When using something like `useRouteLoaderData()` we need to provide the route ID of the route we want to get the data from.

This could also be needed when filtering the matches from `useMatches()` to get some specific route by ID.

The problem is that we have no way to know all the possible route IDs statically, this means if we ever change our route names, the code will fail but TS will not detect it.

But we can solve that! Let's write a script to generate a `.d.ts` file that knows all of our route IDs.

```ts
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { z } from "zod";

// We will use these Zod schemas to strongly type the
// output of `npx remix routes --json`
const RouteSchema = z.object({
	id: z.string(),
	file: z.string(),
	path: z.string().optional(),
});

type Route = z.infer<typeof RouteSchema> & {
	children?: Route[];
};

const Schema: z.ZodType<Route> = RouteSchema.extend({
	children: z.lazy(() => Schema.array()).optional(),
});

async function main() {
	let { $ } = await import("execa");

	// We run the script and get the stdout
	let { stdout } = await $`npx remix routes --json`;
	// We parse the JSON using Zod
	let routes = Schema.array().parse(JSON.parse(stdout));
	// We recursively iterate the routes to get the IDs
	let ids = routes.flatMap((route) => iteration(route));

	await writeFile(
		resolve("./types/route-id.d.ts"),
		`export type RouteId = ${ids.map((id) => `"${id}"`).join(" | ")}`
	);
}

main();

// This function receives a route, if it has no children
// it returns the ID, if it has it returns all the IDs
function iteration(route: Route): string | string[] {
	if (!route.children) return route.id;
	return [route.id, ...route.children.flatMap((child) => iteration(child))];
}
```

We could run this script with:

```bash
node --require esbuild-register scripts/route-id.ts
```

After we run this script, we will have a files in `types/route-id.d.ts` like this:

```ts
export type RouteId =
	| "root"
	| "routes/logout"
	| "routes/auth"
	| "routes/auth.callback"
	| "routes/_"
	| "routes/_._index";
```

Let's create a wrapper of `useRouteLoaderData` to give us more type-safety:

```ts
import type { RouteId } from "~/types/route-id";
import { useRouteLoaderData } from "@remix-run/react";

export function useRouteLoaderDataTyped<T = unknown>(routeId: RouteId) {
	return useRouteLoaderData(routeId) as SerializeFrom<T>;
}
```

This hook will only accept valid route IDs from our type, if we change the routes we can run the script again to let TS catch and invalid route ID.

We can use it in our components like this:

```ts
import type { loader as rootLoader } from "~/root";

export default function Index() {
	let rootData = useRouteLoaderDataTyped<typeof rootLoader>("root");
	// use rootData here
}
```
