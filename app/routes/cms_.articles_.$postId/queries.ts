import type { Options } from "prettier";
import * as acornPlugin from "prettier/plugins/acorn";
import * as babelPlugin from "prettier/plugins/babel";
import * as graphqlPlugin from "prettier/plugins/graphql";
import * as htmlPlugin from "prettier/plugins/html";
import * as markdownPlugin from "prettier/plugins/markdown";
import * as postcssPlugin from "prettier/plugins/postcss";
import * as typescriptPlugin from "prettier/plugins/typescript";
import * as yamlPlugin from "prettier/plugins/yaml";
import { format } from "prettier/standalone";
import { getCache } from "~/middleware/cache";

export async function clearCache() {
	let cache = getCache();

	let cacheKeys = await Promise.all([
		cache.list("articles:search:"),
		cache.list("feed:articles:"),
	]);

	await Promise.all(cacheKeys.flat().map((key) => cache.delete(key)));
	await cache.delete("articles:list");
	await cache.delete("feed:articles");
}

export async function prettify(content: string) {
	let options = {
		arrowParens: "always",
		proseWrap: "never",
		semi: true,
		singleQuote: false,
		tabWidth: 2,
		trailingComma: "all",
		useTabs: true,
		parser: "markdown",
		plugins: [
			acornPlugin,
			babelPlugin,
			graphqlPlugin,
			htmlPlugin,
			markdownPlugin,
			postcssPlugin,
			typescriptPlugin,
			yamlPlugin,
		],
	} satisfies Options;

	return await format(content, options);
}
