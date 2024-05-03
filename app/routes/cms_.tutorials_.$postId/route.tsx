import type {
	ActionFunctionArgs,
	LinksFunction,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import type { action as editorAction } from "../components.editor/route";

import { json, redirectDocument } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import dark from "prism-theme-github/themes/prism-theme-github-copilot.css";
import light from "prism-theme-github/themes/prism-theme-github-light.css";
import { useEffect, useMemo, useRef } from "react";
import { z } from "zod";

import { useValue } from "~/helpers/use-value.hook";
import { Tutorial } from "~/models/tutorial.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";
import { Form } from "~/ui/Form";
import { Schemas } from "~/utils/schemas";
import { assertUUID } from "~/utils/uuid";

import { Preview } from "../components.editor/route";
import { Provider, useEditor } from "../components.editor/use-editor";

import { Actions } from "./actions";
import { Controls } from "./controls";
import { Editor } from "./editor";
import { clearCache, prettify } from "./queries";
import { QuickActions } from "./quick-actions";

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: light, media: "(prefers-color-scheme: light)" },
	{ rel: "stylesheet", href: dark, media: "(prefers-color-scheme: dark)" },
];

export const handle: SDX.Handle = { hydrate: true };

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	await SessionStorage.requireUser(context, request);

	if (params.postId === "new") {
		return json({
			mode: "write" as const,
			tutorial: {
				id: null,
				content: "",
				excerpt: "",
				slug: "",
				title: "",
				tags: [],
			},
		});
	}

	let postId = z.string().uuid().parse(params.postId);
	assertUUID(postId);

	let tutorial = await Tutorial.findById({ db: database(context.db) }, postId);

	return json({
		mode: "update" as const,
		tutorial: {
			id: postId,
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
	assertUUID(authorId);

	let formData = await request.formData();

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
		.safeParse(formData);

	if (!result.success) {
		return json(null, { status: 400 });
	}

	let body = result.data;

	let db = database(context.db);

	let intent = z
		.enum(["write", "update", "prettify"])
		.parse(formData.get("intent"));

	if (intent === "prettify") {
		try {
			let content = await prettify(body.content);
			return json({ intent, content });
		} catch (error) {
			return json({ intent, content: body.content });
		}
	}

	if (intent === "write") {
		await Tutorial.create({ db }, { ...body, authorId });
		await clearCache(context);
	}

	if (intent === "update") {
		let postId = z.string().uuid().parse(params.postId);
		assertUUID(postId);

		await Tutorial.update({ db }, postId, { ...body, authorId });
	}

	throw redirectDocument(`/tutorials/${body.slug}`);
}

export default function Component() {
	let loaderData = useLoaderData<typeof loader>();

	let [title] = useValue(
		loaderData.tutorial.id
			? Symbol.for(`tutorial:${loaderData.tutorial.id}:title`)
			: Symbol.for("tutorial:new:title"),
		loaderData.tutorial.title,
	);

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
		let content = stateValue;
		if (title.trim() !== "") content = `# ${title}\n${stateValue}`;
		submit({ content }, { action: "/components/editor", method: "post" });
	}, [submit, title, stateValue]);

	return (
		<Provider value={providerValue}>
			<Form method="post" className="h-screen p-4">
				<Actions />

				<div className="flex h-full w-full flex-grow flex-row gap-4 overflow-hidden">
					<Controls />

					<Editor
						value={stateValue}
						onChange={(value) =>
							dispatch({ type: "write", payload: { value } })
						}
					/>

					<div className="h-full max-w-prose flex-grow overflow-auto">
						<Preview rendereable={data?.content} />
					</div>

					<QuickActions dispatch={dispatch} />
				</div>
			</Form>
		</Provider>
	);
}
