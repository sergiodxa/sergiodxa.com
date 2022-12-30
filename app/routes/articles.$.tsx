import type {
	LinksFunction,
	LoaderArgs,
	MetaFunction,
} from "@remix-run/cloudflare";

import { Tag } from "@markdoc/markdoc";
import { redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { MarkdownView } from "~/components/markdown";
import { i18n } from "~/services/i18n.server";
import { parseMarkdown } from "~/services/md.server";
import highlightStyles from "~/styles/highlight.css";
import { generateID } from "~/utils/generate-id";
import { json } from "~/utils/http";
import { measure } from "~/utils/measure";

export let links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: highlightStyles }];
};

export function loader({ request, context, params }: LoaderArgs) {
	return measure("routes/articles.$id#loader", async () => {
		void context.services.log.http(request);

		let path = params["*"];

		if (!path) return redirect("/articles");

		try {
			let note = await context.services.cn.readNote(path);

			let headers = new Headers({
				"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
			});

			return json(
				{
					body() {
						return parseMarkdown(note.body, {
							nodes: {
								heading: {
									children: ["inline"],
									attributes: {
										id: { type: String },
										level: { type: Number, required: true, default: 1 },
									},
									transform(node, config) {
										let attributes = node.transformAttributes(config);
										let children = node.transformChildren(config);

										let id = generateID(children, attributes);

										return new Tag(
											`h${node.attributes["level"]}`,
											{ ...attributes, id },
											children
										);
									},
								},
							},
						});
					},
					async meta() {
						let t = await i18n.getFixedT(request);

						return {
							title: t("article.meta.title", { note: note.title }),
							description: note.headline,
						};
					},
				},
				{ headers }
			);
		} catch {
			return redirect("/articles");
		}
	});
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) return {};
	return data.meta;
};

export default function Article() {
	let { body } = useLoaderData<typeof loader>();

	return (
		<section className="space-y-4">
			<article className="dark:prose-dark prose prose-blue mx-auto sm:prose-lg">
				<MarkdownView content={body} />
			</article>
		</section>
	);
}
