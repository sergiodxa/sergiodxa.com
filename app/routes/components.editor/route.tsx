import type { Actions } from "./use-editor";
import type { RenderableTreeNode } from "@markdoc/markdoc";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import type { Dispatch, RefObject } from "react";

import { json } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { useEffect, useMemo, useRef } from "react";
import { z } from "zod";

import Icon from "~/components/icon";
import { MarkdownView } from "~/components/markdown";
import { Markdown } from "~/modules/md.server";
import { Toolbar } from "~/ui/Toolbar";
import { Schemas } from "~/utils/schemas";

import { Button } from "./buttons";
import { Provider, useEditor } from "./use-editor";

export let handle: SDX.Handle = { hydrate: true };

export async function action({ request, context }: ActionFunctionArgs) {
	try {
		let markdown = await context.time("parseFormData", async () => {
			let { content } = await Schemas.formData()
				.pipe(z.object({ content: z.string() }))
				.promise()
				.parse(request.formData());
			return content;
		});

		let content = await context.time("parseMarkdown", async () =>
			Markdown.parse(markdown),
		);

		return json({ content });
	} catch {
		return json({ content: null });
	}
}

type TextboxProps = {
	value: string;
	dispatch: Dispatch<Actions>;
	fieldRef: RefObject<HTMLTextAreaElement>;
};

export function Textbox(props: TextboxProps) {
	return (
		<div className="flex h-full flex-col rounded-md border border-neutral-300 bg-white dark:bg-zinc-800">
			<div role="menubar" className="flex items-center justify-between p-2">
				<div className="flex items-center gap-x-1 text-zinc-700 dark:text-zinc-300">
					<Icon icon="markdown" className="h-4 w-4" />
					<span className="text-xs">Markdown is supported</span>
				</div>

				<Toolbar aria-label="Text Formatting" orientation="horizontal">
					<Button.Bold />
					<Button.Italic />
					<Button.Link />
					<Button.Code />
					<Button.Quote />
					<Button.Image />
					<Button.Heading />
				</Toolbar>
			</div>

			<textarea
				name="content"
				ref={props.fieldRef}
				value={props.value}
				onChange={(event) => {
					let value = event.currentTarget.value;
					props.dispatch({ type: "write", payload: { value } });
				}}
				className="mx-2 mb-2 flex-grow resize-none rounded-md border-none font-mono ring-blue-600 focus:outline-none focus:ring-2"
			/>
		</div>
	);
}

type PreviewProps = {
	rendereable?: RenderableTreeNode;
};

export function Preview(props: PreviewProps) {
	return (
		<div className="prose prose-blue max-w-prose overflow-y-auto sm:prose-lg dark:prose-invert">
			{props.rendereable ? <MarkdownView content={props.rendereable} /> : null}
		</div>
	);
}

export function Editor({ defaultContent }: { defaultContent?: string }) {
	let { submit, data } = useFetcher<typeof action>();
	let $textarea = useRef<HTMLTextAreaElement>(null);

	let [state, dispatch] = useEditor($textarea.current, defaultContent);

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
			<div className="grid h-[calc(100vh-90px-72px-64px)] gap-4 sm:grid-cols-2">
				<Textbox fieldRef={$textarea} value={stateValue} dispatch={dispatch} />
				<Preview rendereable={data?.content} />
			</div>
		</Provider>
	);
}
