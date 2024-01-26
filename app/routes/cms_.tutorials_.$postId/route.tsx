import type { action as editorAction } from "../components.editor/route";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
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

export const handle: SDX.Handle = { hydrate: true };

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	await SessionStorage.requireUser(context, request);

	let db = database(context.db);
	let postId = z.string().uuid().parse(params.postId);
	assertUUID(postId);
	let tutorial = await Tutorial.findById({ db }, postId);

	return json({ tutorial: tutorial.toJSON() });
}

export async function action({ request, params, context }: ActionFunctionArgs) {
	let { id: authorId } = await SessionStorage.requireUser(context, request);

	let postId = z.string().uuid().parse(params.postId);
	assertUUID(postId);

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

	await Tutorial.update({ db }, postId, { ...body, authorId });

	throw redirect(`/tutorials/${body.slug}`);
}

export default function Component() {
	let loaderData = useLoaderData<typeof loader>();

	let [title, setTitle] = useState(loaderData.tutorial.title);

	let { submit, data } = useFetcher<typeof editorAction>();
	let $textarea = useRef<HTMLTextAreaElement>(null);

	let [state, dispatch] = useEditor(
		$textarea.current,
		loaderData.tutorial.content,
	);

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
						Edit Tutorial
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
							value={loaderData.tutorial.slug}
							className="w-full rounded-md border-2 border-blue-600 bg-white px-4 py-2 text-base"
						/>
					</TextField>

					<TextField name="excerpt" className="flex flex-col gap-0.5">
						<Label className="text-sm font-medium text-gray-700">Excerpt</Label>
						<Input
							type="text"
							maxLength={140}
							name="excerpt"
							defaultValue={loaderData.tutorial.excerpt}
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
