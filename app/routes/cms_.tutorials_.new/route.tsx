import type { action as editorAction } from "../components.editor/route";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/cloudflare";

import { redirect } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { parameterize } from "inflected";
import { ImagePlus } from "lucide-react";
import dark from "prism-theme-github/themes/prism-theme-github-copilot.css";
import light from "prism-theme-github/themes/prism-theme-github-light.css";
import { useEffect, useMemo, useRef } from "react";
import { Heading } from "react-aria-components";
import { useHydrated } from "remix-utils/use-hydrated";
import { z } from "zod";

import { useValue } from "~/helpers/use-value.hook";
import { Tutorial } from "~/models/tutorial.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";
import { Button } from "~/ui/Button";
import { FieldGroup, TextArea } from "~/ui/Field";
import { Form } from "~/ui/Form";
import { TextField } from "~/ui/TextField";
import { Toolbar } from "~/ui/Toolbar";
import { Schemas } from "~/utils/schemas";
import { assertUUID } from "~/utils/uuid";

import { Preview } from "../components.editor/route";
import { Provider, useEditor } from "../components.editor/use-editor";

import { clearCache } from "./queries";

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: light, media: "(prefers-color-scheme: light)" },
	{ rel: "stylesheet", href: dark, media: "(prefers-color-scheme: dark)" },
];

export const handle: SDX.Handle = { hydrate: true };

export async function action({ request, context }: ActionFunctionArgs) {
	let { id: authorId } = await SessionStorage.requireUser(context, request);

	let body = Schemas.formData()
		.pipe(
			z.object({
				content: z.string(),
				title: z.string().max(140),
				slug: z.string(),
				excerpt: z.string(),
				tags: z
					.string()
					.optional()
					.transform((value) => value?.split(" ")),
			}),
		)
		.parse(await request.formData());

	let db = database(context.db);

	assertUUID(authorId);

	await Tutorial.create({ db }, { ...body, authorId });

	await clearCache(context);

	throw redirect(`/tutorials/${body.slug}`);
}

export default function Component() {
	let [title] = useValue(Symbol.for("tutorial:new:title"), "");

	let { submit, data } = useFetcher<typeof editorAction>();
	let $textarea = useRef<HTMLTextAreaElement>(null);

	let [state, dispatch] = useEditor($textarea.current, "");

	let stateValue = state.value;

	let providerValue = useMemo(() => {
		return { element: $textarea, state, dispatch };
	}, [dispatch, state]);

	useEffect(() => {
		let content = stateValue;
		if (title.trim() !== "") content = `# ${title}\n${stateValue}`;
		submit({ content }, { action: "/components/editor", method: "post" });
	}, [submit, title, stateValue]);

	return (
		<Provider value={providerValue}>
			<Form method="post" className="h-screen p-4">
				<Toolbar className="rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
					<div className="flex-grow" />
					<Button type="submit" variant="primary">
						Save
					</Button>
				</Toolbar>

				<div className="flex h-full w-full flex-grow flex-row gap-4 overflow-hidden">
					<Controls />

					<Editor
						onChange={(value) =>
							dispatch({ type: "write", payload: { value } })
						}
					/>

					<div className="h-full max-w-prose flex-grow overflow-auto">
						<Preview rendereable={data?.content} />
					</div>

					<Toolbar
						orientation="vertical"
						className="rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800"
					>
						<Button
							type="button"
							variant="icon"
							aria-label="Upload image"
							className="size-10"
						>
							<ImagePlus className="size-4" />
						</Button>
					</Toolbar>
				</div>
			</Form>
		</Provider>
	);
}

function Controls() {
	let isHydrated = useHydrated();

	let [title, setTitle] = useValue(Symbol.for("tutorial:new:title"), "");
	let slug = parameterize(title);

	return (
		<div className="flex max-w-sm flex-grow flex-col items-stretch gap-4">
			<Heading className="text-2xl font-medium capitalize">
				Write a Tutorial
			</Heading>

			<TextField
				name="title"
				label="Title"
				description="A title should summarize the tip and explain what
            it is about clearly."
				onChange={setTitle}
				value={title}
				maxLength={140}
			/>

			<TextField
				name="slug"
				label="Slug"
				description="Automatically generated based on the title."
				onChange={setTitle}
				value={slug}
				maxLength={140}
				isReadOnly={isHydrated}
			/>

			<TextField
				name="tags"
				label="Tags"
				description="A blank space separated list of tags to help suggest similar tutorials."
			/>

			<TextField
				type="textarea"
				name="excerpt"
				label="Excerpt"
				maxLength={140}
				className="resize-none"
			/>
		</div>
	);
}

type EditorProps = {
	onChange(value: string): void;
};

function Editor({ onChange }: EditorProps) {
	let $textarea = useRef<HTMLTextAreaElement>(null);
	let [state, dispatch] = useEditor($textarea.current, "");
	let stateValue = state.value;

	return (
		<FieldGroup className="h-auto flex-grow flex-col items-stretch">
			<TextArea
				ref={$textarea}
				name="content"
				value={stateValue}
				onChange={(event) => {
					onChange(event.currentTarget.value);
					let value = event.currentTarget.value;
					dispatch({ type: "write", payload: { value } });
				}}
				className="h-auto flex-grow resize-none font-mono"
			/>
		</FieldGroup>
	);
}
