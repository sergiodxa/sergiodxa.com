import type { DataFunctionArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { useEffect, useMemo, useRef } from "react";
import { z } from "zod";

import { MarkdownView } from "~/components/markdown";
import { parseMarkdown } from "~/md.server";
import { Schemas } from "~/utils/schemas";

import { Button } from "./buttons";
import { Provider, useEditor } from "./use-editor";

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
		parseMarkdown(markdown),
	);

	return json({ content });
}

export function Editor() {
	let { submit, data } = useFetcher<typeof action>();
	let $textarea = useRef<HTMLTextAreaElement>(null);

	let [state, dispatch] = useEditor($textarea.current);

	let stateValue = state.value;

	let providerValue = useMemo(() => {
		return { element: $textarea, state, dispatch };
	}, [dispatch, state]);

	useEffect(() => {
		submit(
			{ content: stateValue },
			{ action: "/components/editor", method: "post" },
		);
	}, [submit, stateValue]);

	return (
		<Provider value={providerValue}>
			<div className="grid h-[calc(100vh-90px-32px)] gap-4 sm:grid-cols-2">
				<div className="flex h-full flex-col rounded-md border border-neutral-300 bg-white">
					<div role="menubar" className="flex items-center justify-between p-2">
						<div className="flex items-center gap-x-1 text-gray-700">
							<svg width={16} height={16}>
								<use href="/icons?name=markdown#markdown" />
							</svg>
							<span className="text-xs">Markdown is supported</span>
						</div>

						<div className="flex items-center justify-end">
							<Button.Bold />
							<Button.Italic />
							<Button.Link />
							<Button.Code />
							<Button.Quote />
							<Button.Image />
							<Button.Heading />
						</div>
					</div>

					<textarea
						ref={$textarea}
						value={stateValue}
						onChange={(event) => {
							let value = event.currentTarget.value;
							dispatch({ type: "write", payload: { value } });
						}}
						className="mx-2 mb-2 flex-grow resize-none rounded-md border-none font-mono ring-blue-600 focus:outline-none focus:ring-2"
					/>
				</div>

				<div className="prose prose-blue max-w-prose overflow-y-auto">
					{data?.content ? <MarkdownView content={data.content} /> : null}
				</div>
			</div>
		</Provider>
	);
}
