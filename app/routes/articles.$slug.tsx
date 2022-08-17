import { json, type HeadersFunction, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { MarkdownView } from "~/components/markdown";
import { useT } from "~/helpers/use-i18n.hook";
import { i18n } from "~/services/i18n.server";
import { parseMarkdown } from "~/services/md.server";
import { measure } from "~/services/measure.server";

export async function loader({ request, params, context }: LoaderArgs) {
	let headers = new Headers();

	let article = await getArticle();
	if (article) return json({ article }, { headers });

	let t = await i18n.getFixedT(request);
	throw json({ message: t("Not found") }, { status: 404, headers });

	async function getArticle() {
		try {
			return await measure("getArticle", headers, async () => {
				return await context!.cache.run(`article:${params.slug}`, async () => {
					let article = await context!.db.article.findUniqueOrThrow({
						where: { slug: params.slug },
						select: { title: true, headline: true, body: true },
					});

					return {
						title: article.title,
						headline: article.headline,
						body: parseMarkdown(article.body),
					};
				});
			});
		} catch (error) {
			context!.logger.error(error);
			return null;
		}
	}
}

export let headers: HeadersFunction = ({ parentHeaders }) => {
	return {
		"Server-Timing": parentHeaders.get("Server-Timing") || "",
	};
};

export let handle: SDX.Handle = { hydrate: true };

export default function ArticleScreen() {
	let { article } = useLoaderData<typeof loader>();
	return (
		<article className="prose mx-auto">
			<h1>{article.title}</h1>
			<p className="lead">{article.headline}</p>
			<MarkdownView content={article.body} />
		</article>
	);
}

export function CatchBoundary() {
	let t = useT();
	return (
		<article className="prose mx-auto">
			<h1>{t("Article not found")}</h1>
		</article>
	);
}
