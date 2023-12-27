import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { Button, Input, Label, TextField } from "react-aria-components";
import { z } from "zod";

import { SessionStorage } from "~/modules/session.server";
import { assertUUID } from "~/utils/uuid";

import { createQuickLike, queryStats } from "./queries";
import { Stats } from "./stats";

const INTENT = {
	createLike: "CREATE_LIKE" as const,
};

export async function loader({ request, context }: LoaderFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let stats = await queryStats(context);

	return json({ stats });
}

export async function action({ request, context }: ActionFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");
	if (user.role !== "admin") throw redirect("/");

	let formData = await request.formData();

	if (formData.get("intent") === INTENT.createLike) {
		assertUUID(user.id);

		let url = z
			.string()
			.url()
			.transform((value) => new URL(value))
			.parse(formData.get("url"));

		await createQuickLike(context, url, user.id);
		throw redirect("/cms");
	}

	throw redirect("/cms");
}

export default function Component() {
	return (
		<>
			<Stats />
			<CreateLike />
		</>
	);
}

function CreateLike() {
	return (
		<Form method="post" className="flex items-center gap-2" reloadDocument>
			<input type="hidden" name="intent" value={INTENT.createLike} />
			<TextField type="url" className="contents">
				<Label>URL:</Label>
				<Input name="url" />
			</TextField>

			<Button type="submit">Like</Button>
		</Form>
	);
}
