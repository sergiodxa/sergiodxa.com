import { type Schema, Tag } from "@markdoc/markdoc";
import { createHighlighterCore } from "shiki/core";
import ghLight from "shiki/themes/github-light.mjs";
import { z } from "zod";

const ValidationSchema = z.object({
	content: z.string(),
	language: z.string().optional().default("plain"),
	path: z.string().optional(),
});

export const fence: Schema = {
	render: "Fence",
	attributes: { language: { type: String }, path: { type: String } },
	transform(node, config) {
		console.log("attributes", node.attributes);
		let result = ValidationSchema.safeParse(node.attributes);
		if (result.success) {
			console.log("success");

			codeToHTML(result.data.content, result.data.language)
				.then((res) => console.log(res))
				.catch((err) => console.error(err));
		}

		// if (language === "tsx") language = "ts";
		// if (language === "dotenv") language = "plain";
		// if (language === "erb") language = "html";
		// if (language === "mdx") language = "md";
		// if (!language) language = "plain";

		return new Tag(
			"Fence",
			node.transformAttributes(config),
			node.transformChildren(config),
		);
	},
};

async function codeToHTML(content: string, lang: string) {
	await initWasm();
	let highlighter = await createHighlighterCore({
		themes: [ghLight],
		langs: [
			import("shiki/langs/typescript.mjs"),
			import("shiki/langs/diff.mjs"),
			import("shiki/langs/json.mjs"),
			import("shiki/langs/css.mjs"),
		],
	});

	return highlighter.codeToHtml(content, { theme: "github-light", lang });
}
