import type { ActionFunctionArgs } from "@remix-run/cloudflare";

import { redirect } from "@remix-run/cloudflare";
import { parameterize } from "inflected";
import { z } from "zod";

import { Glossary } from "~/models/glossary.server";
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

		let db = database(context.db);

		await Glossary.create(
			{ db },
			{ authorId: user.id, slug: parameterize(term), term, definition },
		);
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
				<TextField label="Term" name="term" defaultValue="SSR" />
				<TextField
					type="textarea"
					label="Definition"
					name="definition"
					defaultValue="An application rendering strategy where the rendering happens in a server, typically at runtime when a new render is requested."
				/>

				<Button type="submit" variant="primary">
					Create
				</Button>
			</Form>
		</>
	);
}