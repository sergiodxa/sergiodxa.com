import {
	type Config,
	parse as markdocParse,
	transform,
} from "@markdoc/markdoc";
import { remark } from "remark";
import strip from "strip-markdown";

import { fence } from "~/components/md/fence.server";

export namespace Markdown {
	export async function parse(
		content: string,
		options: Omit<Config, "nodes"> = {},
	) {
		return transform(markdocParse(content), { ...options, nodes: { fence } });
	}

	export function plain(text: string) {
		return remark().use(strip).process(text);
	}
}
