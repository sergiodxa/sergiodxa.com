import type { DataFunctionArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";

import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/md.server";
import { Schemas } from "~/utils/schemas";

import { Editor } from "./editor";

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

	useEffect(function restoreDraftContent() {
		let saved = localStorage.getItem("write");
		if (saved) return setSavedContent(saved);
	}, []);

	let handleChange = useCallback(
		(content: string) => {
			setContent(content);
			localStorage.setItem("write", content);
			submit({ content }, { method: "post" });
		},
		[submit]
	);

	return (
		<main
			className="mx-auto grid min-h-[calc(100vh-90px-32px)] max-w-screen-xl gap-4 sm:grid-cols-2"
			style={{
				gridTemplateRows: savedContent ? "auto auto 1fr" : "auto 1fr",
			}}
		>
			{savedContent && (
				<aside className="col-span-2">
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

			<Editor value={content} onChange={handleChange} />

			<div className="prose prose-blue max-w-prose">
				{data?.content ? <MarkdownView content={data.content} /> : null}
			</div>
		</main>
	);
}
