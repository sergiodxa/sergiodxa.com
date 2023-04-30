import type { DataFunctionArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/md.server";
import { Schemas } from "~/utils/schemas";

export let handle: SDX.Handle = { hydrate: true };

export async function action({ request, context }: DataFunctionArgs) {
	let markdown = await context.time("parseFormData", async () => {
		let { content } = await Schemas.formData()
			.pipe(z.object({ content: z.string() }))
			.promise()
			.parse(request.formData());
		return content;
	});

	let content = await context.time("parseMarkdown", async () =>
		parseMarkdown(markdown)
	);

	return json({ content });
}

export default function Component() {
	let { submit, data } = useFetcher<typeof action>();

	let [savedContent, setSavedContent] = useState<string | null>(null);
	let [content, setContent] = useState("");

	useEffect(
		function fetchParsedContent() {
			submit({ content }, { method: "post" });
		},
		[content, submit]
	);

	useEffect(function restoreDraftContent() {
		let saved = localStorage.getItem("write");
		if (!saved) return;
		setSavedContent(saved);
	}, []);

	useEffect(
		function saveDraftContent() {
			localStorage.setItem("write", content);
		},
		[content]
	);

	return (
		<main
			className="mx-auto grid min-h-[calc(100vh-90px-32px)] max-w-screen-xl gap-4 sm:grid-cols-2"
			style={{
				gridTemplateRows: savedContent ? "auto 1fr" : "1fr",
			}}
		>
			{savedContent && (
				<aside className="col-span-2 h-6">
					<button
						type="button"
						onClick={() => {
							if (savedContent) setContent(savedContent);
							setSavedContent(null);
						}}
					>
						Restore
					</button>
					<button
						type="button"
						onClick={() => {
							setSavedContent(null);
							localStorage.removeItem("write");
						}}
					>
						Discard
					</button>
				</aside>
			)}

			<textarea
				value={content}
				onChange={(event) => {
					let value = event.currentTarget.value;
					setContent(value);
					localStorage.setItem("write", value);
				}}
				className="resize-none"
			/>

			<div className="prose prose-blue max-w-prose">
				{data?.content ? <MarkdownView content={data.content} /> : null}
			</div>
		</main>
	);
}
