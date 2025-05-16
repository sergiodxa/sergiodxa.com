import { href, redirect } from "react-router";
import { z } from "zod";
import { ok } from "~/helpers/response";
import { getDB } from "~/middleware/drizzle";
import { requireUser } from "~/middleware/session";
import { Like } from "~/models/like.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { TextField } from "~/ui/TextField";
import { Schemas } from "~/utils/schemas";
import { assertUUID } from "~/utils/uuid";
import type { Route } from "./+types/route";

export async function loader({ params }: Route.LoaderArgs) {
	let id = z.string().parse(params.postId);
	assertUUID(id);

	let db = getDB();

	let like = await Like.show({ db }, id);

	return ok({ like: { title: like.title, url: like.url } });
}

export async function action({ request, params }: Route.ActionArgs) {
	let id = z.string().parse(params.postId);
	assertUUID(id);

	let db = getDB();

	let { title, url } = await Schemas.formData()
		.pipe(z.object({ title: z.string(), url: z.string().url() }))
		.promise()
		.parse(request.formData());

	let user = requireUser();
	await Like.update({ db }, id, { authorId: user.id, title, url });

	return redirect(href("/cms/likes"));
}

export default function Component({ loaderData }: Route.ComponentProps) {
	return (
		<Form method="post">
			<TextField
				label="Title"
				name="title"
				type="text"
				defaultValue={loaderData.like.title}
			/>

			<TextField
				label="URL"
				name="url"
				type="url"
				defaultValue={loaderData.like.url.toString()}
			/>

			<Button type="submit" variant="primary">
				Save
			</Button>
		</Form>
	);
}
