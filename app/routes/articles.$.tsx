import type {
	LoaderArgs,
	MetaFunction,
	SerializeFrom,
} from "@remix-run/cloudflare";
import type { ThrownResponse } from "@remix-run/react";
import type { Article as SchemaArticle } from "schema-dts";

import { redirect } from "@remix-run/cloudflare";
import { useCatch, useLoaderData } from "@remix-run/react";

import { MarkdownView } from "~/components/markdown";
import { i18n } from "~/i18n.server";
import { NoteNotFoundError } from "~/repositories/notes";
import { json } from "~/utils/http";
import { measure } from "~/utils/measure";

export function loader({ request, context, params }: LoaderArgs) {
	return measure("routes/articles.$id#loader", async () => {
		void context.services.log.http(request);

		let path = params["*"];

		if (!path) return redirect("/articles");

		try {
			let note = await context.services.notes.read.perform(path);

			let headers = new Headers({
				"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
			});

			return json(
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
				throw json(
					{ message: t("error.NOTE_NOT_FOUND", { path }) },
					{ status: 404 }
				);
			}

			return redirect("/articles");
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
		<article className="dark:prose-dark prose prose-blue mx-auto sm:prose-lg">
			<MarkdownView content={body} />
		</article>
	);
}

export function CatchBoundary() {
	let caught = useCatch<ThrownResponse<404, { message: string }>>();
	return (
		<article className="dark:prose-dark prose prose-blue mx-auto sm:prose-lg">
			<h1>{caught.data.message}</h1>
		</article>
	);
}
