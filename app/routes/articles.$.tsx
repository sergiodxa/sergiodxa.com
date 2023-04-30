import type {
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/cloudflare";
import type { ThrownResponse } from "@remix-run/react";
import type { Article as SchemaArticle } from "schema-dts";

import { redirect } from "@remix-run/cloudflare";
import { useCatch, useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils";

import { MarkdownView } from "~/components/markdown";
import { Support } from "~/components/support";
import { i18n } from "~/i18n.server";
import { NoteNotFoundError } from "~/repositories/notes";

export function loader({ request, context, params }: LoaderArgs) {
	return context.time("routes/articles.$id#loader", async () => {
		void context.services.log.http(request);

		let path = params["*"];

		if (!path) throw redirect("/articles");

		try {
			let note = await context.services.notes.read.perform(path);

			let headers = new Headers({
				"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
			});

			return jsonHash(
				{
					body: note.body,
					structuredData() {
						return {
							wordCount: note.wordCount,
							datePublished: note.datePublished.toISOString(),
							dateModified: note.dateModified.toISOString(),
						};
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
		} catch (error) {
			if (error instanceof NoteNotFoundError) {
				let t = await i18n.getFixedT(request);
				throw jsonHash(
					{ message: t("error.NOTE_NOT_FOUND", { path }) },
					{ status: 404 }
				);
			}

			throw redirect("/articles");
		}
	});
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) return {};
	return data.meta;
};

export let handle: SDX.Handle<SerializeFrom<typeof loader>, SchemaArticle> = {
	structuredData({ data }) {
		if (!data) return [];
		return {
			"@context": "https://schema.org",
			"@type": "Article",
			headline: data.meta.title,
			description: data.meta.description,
			author: {
				"@type": "Person",
				name: "Sergio Xalambrí",
				url: "https://sergiodxa.com/about",
			},
			wordCount: data.structuredData.wordCount,
			datePublished: data.structuredData.datePublished,
			dateModified: data.structuredData.dateModified,
		};
	},
};

export default function Article() {
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

export function CatchBoundary() {
	let caught = useCatch<ThrownResponse<404, { message: string }>>();
	return (
		<article className="dark:prose-dark prose prose-blue mx-auto max-w-screen-sm sm:prose-lg">
			<h1>{caught.data.message}</h1>
		</article>
	);
}
