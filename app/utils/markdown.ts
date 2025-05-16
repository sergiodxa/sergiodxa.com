import type { Config } from "@markdoc/markdoc";
import { parse as markdocParse, transform } from "@markdoc/markdoc";
import removeMarkdown from "remove-markdown";

import { fence } from "~/components/md/fence";

// biome-ignore lint/complexity/noStaticOnlyClass: I want to use static methods
export class Markdown {
	static parse(content: string, options: Omit<Config, "nodes"> = {}) {
		return transform(markdocParse(content), { ...options, nodes: { fence } });
	}

	static plain(text: string) {
		return removeMarkdown(text);
	}
}
