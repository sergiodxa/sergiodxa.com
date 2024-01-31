import type { action as editorAction } from "../components.editor/route";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/cloudflare";

import { redirect } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { parameterize } from "inflected";
import dark from "prism-theme-github/themes/prism-theme-github-dark.css";
import light from "prism-theme-github/themes/prism-theme-github-light.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Heading } from "react-aria-components";
import { useHydrated } from "remix-utils/use-hydrated";
import { z } from "zod";

import { Tutorial } from "~/models/tutorial.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { TextField } from "~/ui/TextField";
import { Schemas } from "~/utils/schemas";
import { assertUUID } from "~/utils/uuid";

import { Preview, Textbox } from "../components.editor/route";
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
	let [title, setTitle] = useState("");
	let slug = parameterize(title);

	let isHydrated = useHydrated();

	let { submit, data } = useFetcher<typeof editorAction>();
	let $textarea = useRef<HTMLTextAreaElement>(null);

	let [state, dispatch] = useEditor($textarea.current, "");

	let stateValue = state.value;

	let providerValue = useMemo(() => {
		return { element: $textarea, state, dispatch };
	}, [dispatch, state]);

	useEffect(() => {
		submit(
			{ content: `# ${title}\n${stateValue}` },
			{ action: "/components/editor", method: "post" },
		);
	}, [submit, title, stateValue]);

	return (
		<Provider value={providerValue}>
			<Form
				method="post"
				className="grid min-h-screen w-full grid-cols-2 gap-4"
			>
				<div className="py-4 pl-4">
					<Textbox
						fieldRef={$textarea}
						value={stateValue}
						dispatch={dispatch}
					/>
				</div>

				<div className="flex flex-col gap-2 py-4 pr-4">
					<Heading className="text-2xl font-medium capitalize">
						Write a Tutorial
					</Heading>

					<TextField
						name="title"
						onChange={setTitle}
						label="Title"
						value={title}
						maxLength={140}
					/>

					<TextField
						name="slug"
						onChange={setTitle}
						label="Slug"
						value={slug}
						maxLength={140}
						isReadOnly={isHydrated}
					/>

					<TextField name="excerpt" label="Excerpt" maxLength={140} />

					<Button type="submit" variant="primary">
						Save
					</Button>

					<hr />

					<div>
						<Preview rendereable={data?.content} />
					</div>
				</div>
			</Form>
		</Provider>
	);
}
