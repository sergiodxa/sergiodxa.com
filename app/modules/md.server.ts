import { parse, transform, type Config } from "@markdoc/markdoc";

export class Markdown {
	static parse(content: string, options: Config = {}) {
		return transform(parse(content), options);
	}
}
