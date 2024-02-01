import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";

import { Like } from "~/models/like.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { TextField } from "~/ui/TextField";
import { Schemas } from "~/utils/schemas";
import { assertUUID } from "~/utils/uuid";

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	await SessionStorage.requireUser(context, request, "/auth/login");
	let id = z.string().parse(params.postId);
	assertUUID(id);

	let db = database(context.db);

	let like = await Like.show({ db }, id);

	return json({ like: like.toJSON() });
}

export async function action({ request, params, context }: ActionFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	let id = z.string().parse(params.postId);
	assertUUID(id);

	let db = database(context.db);

	let { title, url } = await Schemas.formData()
		.pipe(z.object({ title: z.string(), url: z.string().url() }))
		.promise()
		.parse(request.formData());

	await Like.update({ db }, id, { authorId: user.id, title, url });

	return redirect("/cms/likes");
}

export default function Component() {
	let { like } = useLoaderData<typeof loader>();

	return (
		<Form method="post">
			<TextField
				label="Title"
				name="title"
				type="text"
				defaultValue={like.title}
			/>

			<TextField label="URL" name="url" type="url" defaultValue={like.url} />

			<Button type="submit" variant="primary">
				Save
			</Button>
		</Form>
	);
}
