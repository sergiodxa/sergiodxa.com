#globby@13.2.2 #node@16.13.0 #@remix-run/server-runtime@1.18.1 #@remix-run/react@1.18.1 #@remix-run/node@1.18.1 #@remix-run/cloudflare@1.18.1

# Strongly type public assets in Remix

Remix gives us two ways to work with assets, we can import them directly and get a string to the hashed file path, or we can place the file inside the `public` folder and reference the file directly.

In most cases, importing the asset is the best approach since the hashed file path will let us cache the file for a year. But if we can't do that, for example if the file needs to be in a specific path and with a specific name, we will need to use the `public` folder.

Examples of this can be `robots.txt`.

The problem is that we have no way to know with TS that the file actually exists, so we're referencing a path that may not exists anymore or may have a typo.

But we can solve that! Let's write a script to generate a `.d.ts` file that knows all of our files inside `public`.

```ts
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
	let { globby } = await import("globby");

	let pattern = [
		"public/**/*", // get all files in public
		"!public/build/**/*", // except public/build
		// these two are for Cloudflare Pages
		"!public/_headers",
		"!public/_routes.json",
	];

	let files = await globby(pattern);

	files = files.map((file) => file.replace("public/", "/"));

	await writeFile(
		resolve("./types/assets.d.ts"),
		`export type Assets = ${files.map((file) => `"${file}"`).join(" | ")}`
	);
}

main();
```

We could run this script with:

```bash
node --require esbuild-register scripts/assets.ts
```

After we run this script, we will have a files in `types/assets.d.ts` like this:

```ts
export type Assets = "/favicon.ico" | "/robots.txt";
```

Let's create a function to ensure the our assets exists:

```ts
import type { Assets } from "~/types/assets";

export function asset(file: Assets, base?: URL): string {
	if (!base) return file;
	return new URL(file, base).toString();
}
```

This function will be used like `asset("/robots.txt")`, the `file: Assets` will ensure the file we're referencing exists in our type, even if we later return it as is.

If we add more files to the public folder, or if we delete one, we can run our script again and the type will be updated, after deleting or renaming a file TypeScript will now warn us the file value is invalid and our app could fail at CI.

The second argument `base` will let us get a full path, useful for things like social images (e.g. Open Graph or Twitter Cards) where we need to complete URL.

We can use it in our loader like this:

```ts
export async function loader({ request }: DataFunctionArgs) {
	let socialImage = asset(
		"/social.png",
		new URL(request.url)
	)
	// use socialImage here, probably return it to use it in Meta
}
```
