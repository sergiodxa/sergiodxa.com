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
import { Article } from "~/models/article.server";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";
import { database } from "~/services/db.server";

export function loader({ request, context, params }: LoaderFunctionArgs) {
	return context.time("routes/articles.$id#loader", async () => {
		void new Logger(context).http(request);

		let path = params["*"];

		if (!path) throw redirect("/articles");

		let i18n = new I18n();

		try {
			let db = database(context.db);

			let article = await Article.show({ db }, path);

			let headers = new Headers({
				"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
			});

			return jsonHash(
				{
					title: article.title,
					body: article.renderable,
					async meta(): Promise<MetaDescriptor[]> {
						let t = await i18n.getFixedT(request);

						let author = await article.author;

						return [
							{ title: t("article.meta.title", { note: article.title }) },
							{ name: "description", content: article.excerpt },
							{
								"script:ld+json": {
									"@context": "https://schema.org",
									"@type": "Article",
									headline: article.title,
									description: article.excerpt,
									author: {
										"@type": "Person",
										name: author.displayName,
										url: "https://sergiodxa.com/about",
									},
									wordCount: await article.wordCount,
									datePublished: article.createdAt.toISOString(),
									dateModified: article.updatedAt.toISOString(),
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
