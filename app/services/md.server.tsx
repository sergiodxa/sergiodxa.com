import { parse, transform, type Config } from "@markdoc/markdoc";

export function parseMarkdown(markdown: string, options: Config = {}) {
	return transform(parse(markdown), options);
}
