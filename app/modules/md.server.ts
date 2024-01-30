import { parse, transform, type Config } from "@markdoc/markdoc";
import { remark } from "remark";
import strip from "strip-markdown";

import { fence } from "~/components/md/fence";

export class Markdown {
	static parse(content: string, options: Omit<Config, "nodes"> = {}) {
		return transform(parse(content), { ...options, nodes: { fence } });
	}

	static plain(text: string) {
		return remark().use(strip).process(text);
	}
}
