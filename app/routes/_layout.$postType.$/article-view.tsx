import type { loader } from "./route";

import { useLoaderData } from "@remix-run/react";

import { MarkdownView } from "~/components/markdown";
import { Support } from "~/components/support";

export function ArticleView() {
	let loaderData = useLoaderData<typeof loader>();

	if (loaderData.postType !== "articles") return null;

	return (
		<article className="mx-auto mb-8 flex max-w-screen-md flex-col gap-8">
			<div className="prose prose-blue mx-auto w-full max-w-prose space-y-8 sm:prose-lg">
				<MarkdownView content={loaderData.article.body} />
			</div>
			<Support />
		</article>
	);
}
