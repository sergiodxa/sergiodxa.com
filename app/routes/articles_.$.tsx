import type {
	LoaderFunctionArgs,
	MetaFunction,
	MetaDescriptor,
} from "@remix-run/cloudflare";

import { redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils/json-hash";

import { MarkdownView } from "~/components/markdown";
import { Support } from "~/components/support";
import { i18n } from "~/i18n.server";
import { Article } from "~/models/article.server";
import { Logger } from "~/modules/logger.server";
import { Cache } from "~/services/cache.server";
import { CollectedNotes } from "~/services/cn.server";

export function loader({ request, context, params }: LoaderFunctionArgs) {
	return context.time("routes/articles.$id#loader", async () => {
		void new Logger(context.env.LOGTAIL_SOURCE_TOKEN).http(request);

		let path = params["*"];

		if (!path) throw redirect("/articles");

		try {
			let cache = new Cache(context.kv.cn);
			let cn = new CollectedNotes(
				context.env.CN_EMAIL,
				context.env.CN_TOKEN,
				context.env.CN_SITE,
			);

			let article = await Article.show({ cache, cn }, path);

			let headers = new Headers({
				"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
			});

			return jsonHash(
				{
					body: article.body,
					// structuredData() {
					// 	return {
					// 		wordCount: note.wordCount,
					// 		datePublished: note.datePublished.toISOString(),
					// 		dateModified: note.dateModified.toISOString(),
					// 	};
					// },
					async meta(): Promise<MetaDescriptor[]> {
						let t = await i18n.getFixedT(request);

						return [
							{ title: t("article.meta.title", { note: article.title }) },
							// { name: "description", content: note.headline },
							{
								"script:ld+json": {
									"@context": "https://schema.org",
									"@type": "Article",
									headline: article.title,
									// description: note.headline,
									author: {
										"@type": "Person",
										name: "Sergio Xalambrí",
										url: "https://sergiodxa.com/about",
									},
									// wordCount: note.wordCount,
									// datePublished: note.datePublished.toISOString(),
									// dateModified: note.dateModified.toISOString(),
								},
							},
						];
					},
				},
				{ headers },
			);
		} catch (error) {
			let t = await i18n.getFixedT(request);
			throw jsonHash(
				{ message: t("error.NOTE_NOT_FOUND", { path }) },
				{ status: 404 },
			);
		}
	});
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) return [];
	return data.meta;
};

export default function Component() {
	let { body } = useLoaderData<typeof loader>();

	return (
		<article className="mx-auto mb-8 flex max-w-screen-md flex-col gap-8">
			<div className="prose prose-blue mx-auto w-full max-w-prose space-y-8 sm:prose-lg">
				<MarkdownView content={body} />
			</div>
			<Support />
		</article>
	);
}
