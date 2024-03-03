import type { AppLoadContext } from "@remix-run/cloudflare";

import acornPlugin from "prettier/plugins/acorn";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import graphqlPlugin from "prettier/plugins/graphql";
import htmlPlugin from "prettier/plugins/html";
import markdownPlugin from "prettier/plugins/markdown";
import postcssPlugin from "prettier/plugins/postcss";
import typescriptPlugin from "prettier/plugins/typescript";
import yamlPlugin from "prettier/plugins/yaml";
import { format } from "prettier/standalone";

import { Cache } from "~/modules/cache.server";

export async function clearCache(context: AppLoadContext) {
	let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);

	let cacheKeys = await Promise.all([
		cache.list("tutorials:search:"),
		cache.list("feed:tutorials:"),
	]);

	await Promise.all(cacheKeys.flat().map((key) => cache.delete(key)));
	await cache.delete("tutorials:list");
	await cache.delete("feed:tutorials");
}

export async function prettify(content: string) {
	return await format(content, {
		arrowParens: "always",
		experimentalTernaries: true,
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
			estreePlugin,
			graphqlPlugin,
			htmlPlugin,
			markdownPlugin,
			postcssPlugin,
			typescriptPlugin,
			yamlPlugin,
		],
	});
}
