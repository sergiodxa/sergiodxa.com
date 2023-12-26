import { parse, transform, type Config } from "@markdoc/markdoc";
import { remark } from "remark";
import strip from "strip-markdown";

export class Markdown {
	static parse(content: string, options: Config = {}) {
		return transform(parse(content), options);
	}

	static plain(text: string) {
		return remark().use(strip).process(text);
	}
}
