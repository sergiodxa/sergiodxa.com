import { parameterize } from "inflected";
import { redirect, redirectDocument } from "react-router";
import { href } from "react-router";
import { z } from "zod";
import { ok } from "~/helpers/response";
import { getCache } from "~/middleware/cache";
import { getDB } from "~/middleware/drizzle";
import { requireUser } from "~/middleware/session";
import { Glossary } from "~/models/glossary.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { TextField } from "~/ui/TextField";
import { Schemas } from "~/utils/schemas";
import { assertUUID } from "~/utils/uuid";
import type { Route } from "./+types/route";
import { INTENT } from "./types";

export async function loader({ params }: Route.LoaderArgs) {
	if (params.id === "new") {
		return ok({
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

	let db = getDB();
	assertUUID(params.id);

	let glossary = await Glossary.show({ db }, params.id);

	return ok({
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

export async function action({ request, params, context }: Route.ActionArgs) {
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

		let db = getDB();
		let user = requireUser();

		await Glossary.create(
			{ db },
			{ authorId: user.id, slug, term, title, definition },
		);

		let cache = getCache();
		let cacheKey = await cache.list("feed:glossary:");

		await Promise.all([
			cache.delete("feed:glossary"),
			await Promise.all(cacheKey.map((key) => cache.delete(key))),
		]);

		return redirectDocument(`${href("/glossary")}#${slug}`);
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

		let db = getDB();

		let id = params.id;
		assertUUID(id);

		let user = requireUser();

		await Glossary.update({ db }, id, {
			authorId: user.id,
			term,
			title,
			definition,
			slug,
		});

		let cache = getCache();
		let cacheKey = await cache.list("feed:glossary:");

		await Promise.all([
			cache.delete("feed:glossary"),
			await Promise.all(cacheKey.map((key) => cache.delete(key))),
		]);

		return redirectDocument(`${href("/glossary")}#${slug}`);
	}

	return redirect(href("/glossary"));
}

export default function Component({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<header className="flex justify-between">
				<h2 className="text-3xl font-bold">Glossary</h2>
			</header>

			<Form method="post" className="max-w-xs">
				<input type="hidden" name="intent" value={loaderData.mode} />
				<TextField
					label="Term"
					name="term"
					isRequired
					defaultValue={loaderData.glossary.term}
				/>

				{loaderData.mode === INTENT.update && (
					<TextField
						label="Slug"
						name="slug"
						defaultValue={loaderData.glossary.slug}
					/>
				)}

				<TextField
					label="Title"
					name="title"
					defaultValue={loaderData.glossary.title}
				/>
				<TextField
					type="textarea"
					label="Definition"
					name="definition"
					isRequired
					defaultValue={loaderData.glossary.definition}
				/>

				<Button type="submit" variant="primary">
					Create
				</Button>
			</Form>
		</>
	);
}
