import type { DataFunctionArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";

import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/md.server";
import { Schemas } from "~/utils/schemas";

export let handle: SDX.Handle = { hydrate: true };

export async function action({ request, context }: DataFunctionArgs) {
	return context.time("routes/write#action", async () => {
		let { content } = await Schemas.formData()
			.pipe(z.object({ content: z.string() }))
			.promise()
			.parse(request.formData());

		return json({ content: parseMarkdown(content) });
	});
}

export default function Component() {
	let fetcher = useFetcher<typeof action>();

	return (
		<main className="mx-auto grid min-h-[calc(100vh-90px-32px)] max-w-screen-xl gap-4 sm:grid-cols-2">
			<textarea
				onChange={(event) => {
					let content = event.currentTarget.value;
					fetcher.submit({ content }, { method: "post" });
				}}
				className="resize-none"
			/>

			<div className="prose prose-blue max-w-prose">
				{fetcher.data?.content ? (
					<MarkdownView content={fetcher.data.content} />
				) : null}
			</div>
		</main>
	);
}
