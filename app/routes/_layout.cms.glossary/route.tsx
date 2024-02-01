import type { ActionFunctionArgs } from "@remix-run/cloudflare";

import { redirect, redirectDocument } from "@remix-run/cloudflare";
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

import { INTENT } from "./types";

export async function action({ request, context }: ActionFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");

	let formData = await request.formData();

	let intent = formData.get("intent");

	if (intent === INTENT.create) {
		let { term, definition } = Schemas.formData()
			.pipe(z.object({ term: z.string(), definition: z.string() }))
			.parse(formData);

		let slug = parameterize(term);

		let db = database(context.db);

		await Glossary.create(
			{ db },
			{ authorId: user.id, slug, term, definition },
		);

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
	return (
		<>
			<header className="flex justify-between">
				<h2 className="text-3xl font-bold">Glossary</h2>
			</header>

			<Form method="post" className="max-w-xs">
				<input type="hidden" name="intent" value={INTENT.create} />
				<TextField label="Term" name="term" />
				<TextField type="textarea" label="Definition" name="definition" />

				<Button type="submit" variant="primary">
					Create
				</Button>
			</Form>
		</>
	);
}
