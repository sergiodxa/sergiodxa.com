import type { action as editorAction } from "../components.editor/route";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";

import { redirect } from "@remix-run/cloudflare";
import { Form, useFetcher } from "@remix-run/react";
import { parameterize } from "inflected";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	Button,
	Heading,
	Input,
	Label,
	TextField,
} from "react-aria-components";
import { z } from "zod";

import { Tutorial } from "~/models/tutorial.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";
import { Schemas } from "~/utils/schemas";
import { assertUUID } from "~/utils/uuid";

import { Preview, Textbox } from "../components.editor/route";
import { Provider, useEditor } from "../components.editor/use-editor";

export const matches = {
	noPadding: true,
};

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

	throw redirect(`/tutorials/${body.slug}`);
}

export default function Component() {
	let [title, setTitle] = useState("");
	let slug = parameterize(title);

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
				className="grid min-h-[calc(100vh-90px)] w-full grid-cols-2 gap-4"
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
						className="flex flex-col gap-0.5"
						onChange={setTitle}
					>
						<Label className="text-sm font-medium text-gray-700">Title</Label>
						<Input
							type="text"
							maxLength={140}
							name="title"
							value={title}
							className="w-full rounded-md border-2 border-blue-600 bg-white px-4 py-2 text-base"
						/>
					</TextField>

					<TextField name="slug" className="flex flex-col gap-0.5">
						<Label className="text-sm font-medium text-gray-700">Slug</Label>
						<Input
							type="text"
							maxLength={140}
							name="slug"
							readOnly
							value={slug}
							className="w-full rounded-md border-2 border-blue-600 bg-white px-4 py-2 text-base"
						/>
					</TextField>

					<TextField name="excerpt" className="flex flex-col gap-0.5">
						<Label className="text-sm font-medium text-gray-700">Excerpt</Label>
						<Input
							type="text"
							maxLength={140}
							name="excerpt"
							className="w-full rounded-md border-2 border-blue-600 bg-white px-4 py-2 text-base"
						/>
					</TextField>

					<Button
						type="submit"
						className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
					>
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
