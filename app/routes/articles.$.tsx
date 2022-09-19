import type {
	LinksFunction,
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/cloudflare";

import { Tag } from "@markdoc/markdoc";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { MarkdownView } from "~/components/markdown";
import { i18n } from "~/services/i18n.server";
import { parseMarkdown } from "~/services/md.server";
import highlightStyles from "~/styles/highlight.css";
import { generateID } from "~/utils/generate-id";

export let links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: highlightStyles }];
};

export async function loader({ request, context, params }: LoaderArgs) {
	await context.services.log.http(request);

	let path = params["*"];

	if (!path) return redirect("/articles");

	try {
		let note = await context.services.cn.readNote(path);

		let body = parseMarkdown(note.body, {
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

		let t = await i18n.getFixedT(request);

		let meta = {
			title: t("article.meta.title", { note: note.title }),
			description: note.headline,
		};

		return json({ body, meta });
	} catch {
		return redirect("/articles");
	}
}

export let meta: MetaFunction = ({ data }) => {
	if (!data) return {};
	let { meta } = data as SerializeFrom<typeof loader>;
	return meta;
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
