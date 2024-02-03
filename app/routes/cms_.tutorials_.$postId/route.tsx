import type { action as editorAction } from "../components.editor/route";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Heading } from "react-aria-components";
import { z } from "zod";

import { Tutorial } from "~/models/tutorial.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";
import { Button } from "~/ui/Button";
import { TextField } from "~/ui/TextField";
import { Schemas } from "~/utils/schemas";
import { assertUUID } from "~/utils/uuid";

import { Preview, Textbox } from "../components.editor/route";
import { Provider, useEditor } from "../components.editor/use-editor";

export const handle: SDX.Handle = { hydrate: true };

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	await SessionStorage.requireUser(context, request);

	let postId = z.string().uuid().parse(params.postId);
	assertUUID(postId);

	let db = database(context.db);

	let tutorial = await Tutorial.findById({ db }, postId);

	return json({
		tutorial: {
			content: tutorial.content,
			excerpt: tutorial.excerpt,
			slug: tutorial.slug,
			title: tutorial.title,
			tags: tutorial.tags,
		},
	});
}

export async function action({ request, params, context }: ActionFunctionArgs) {
	let { id: authorId } = await SessionStorage.requireUser(context, request);

	let postId = z.string().uuid().parse(params.postId);
	assertUUID(postId);

	let result = Schemas.formData()
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
		.safeParse(await request.formData());

	if (!result.success) {
		console.log(result.error);
		return json({});
	}

	let body = result.data;

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
						onChange={setTitle}
						label="Title"
						type="text"
						maxLength={140}
						value={title}
					/>

					<TextField
						name="slug"
						label="Slug"
						type="text"
						maxLength={140}
						isReadOnly
						value={loaderData.tutorial.slug}
					/>

					<TextField
						name="excerpt"
						label="Excerpt"
						type="text"
						maxLength={140}
						defaultValue={loaderData.tutorial.excerpt}
					/>

					<TextField
						name="tags"
						label="Tags"
						type="text"
						defaultValue={loaderData.tutorial.tags.join(" ")}
					/>

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
