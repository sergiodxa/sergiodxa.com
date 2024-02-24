import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect, redirectDocument } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { parameterize } from "inflected";
import { z } from "zod";

import { Glossary } from "~/models/glossary.server";
import { Cache } from "~/modules/cache.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { TextField } from "~/ui/TextField";
import { Schemas } from "~/utils/schemas";
import { assertUUID } from "~/utils/uuid";

import { INTENT } from "./types";

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	await SessionStorage.requireUser(context, request);

	if (params.id === "new") {
		return json({
			mode: INTENT.create,
			glossary: {
				id: null,
				title: "",
				term: "",
				definition: "",
				slug: "",
			},
		});
	}

	let db = database(context.db);
	assertUUID(params.id);

	let glossary = await Glossary.show({ db }, params.id);

	return json({
		mode: INTENT.update,
		glossary: {
			id: glossary.id,
			title: glossary.title,
			term: glossary.term,
			definition: glossary.definition,
			slug: glossary.slug,
		},
	});
}

export async function action({ request, params, context }: ActionFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");

	let formData = await request.formData();

	let intent = formData.get("intent");

	if (intent === INTENT.create) {
		let { term, title, definition } = Schemas.formData()
			.pipe(
				z.object({
					term: z.string(),
					title: z.string().optional(),
					definition: z.string(),
				}),
			)
			.parse(formData);

		let slug = parameterize(term);

		let db = database(context.db);

		await Glossary.create(
			{ db },
			{ authorId: user.id, slug, term, title, definition },
		);

		let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);
		let cacheKey = await cache.list("feed:glossary:");
		await Promise.all([
			cache.delete("feed:glossary"),
			await Promise.all(cacheKey.map((key) => cache.delete(key))),
		]);

		throw redirectDocument(`/glossary#${slug}`);
	}

	if (intent === INTENT.update) {
		let { term, title, definition, slug } = Schemas.formData()
			.pipe(
				z.object({
					term: z.string(),
					title: z.string().optional(),
					definition: z.string(),
					slug: z.string(),
				}),
			)
			.parse(formData);

		let db = database(context.db);

		let id = params.id;
		assertUUID(id);

		await Glossary.update({ db }, id, {
			authorId: user.id,
			term,
			title,
			definition,
			slug,
		});

		let cache = new Cache.KVStore(context.kv.cache, context.waitUntil);
		let cacheKey = await cache.list("feed:glossary:");
		await Promise.all([
			cache.delete("feed:glossary"),
			await Promise.all(cacheKey.map((key) => cache.delete(key))),
		]);

		throw redirectDocument(`/glossary#${slug}`);
	}

	throw redirect("/glossary");
}

export default function Component() {
	let { mode, glossary } = useLoaderData<typeof loader>();

	return (
		<>
			<header className="flex justify-between">
				<h2 className="text-3xl font-bold">Glossary</h2>
			</header>

			<Form method="post" className="max-w-xs">
				<input type="hidden" name="intent" value={mode} />
				<TextField
					label="Term"
					name="term"
					isRequired
					defaultValue={glossary.term}
				/>

				{mode === INTENT.update && (
					<TextField label="Slug" name="slug" defaultValue={glossary.slug} />
				)}

				<TextField label="Title" name="title" defaultValue={glossary.title} />
				<TextField
					type="textarea"
					label="Definition"
					name="definition"
					isRequired
					defaultValue={glossary.definition}
				/>

				<Button type="submit" variant="primary">
					Create
				</Button>
			</Form>
		</>
	);
}
