import type { ValidationErrors } from "@react-types/shared";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { useActionData, useSearchParams, useSubmit } from "@remix-run/react";
import { Button, Form, Input, Label, SearchField } from "react-aria-components";

import { useT } from "~/helpers/use-i18n.hook";
import { Like } from "~/models/like.server";
import { I18n } from "~/modules/i18n.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";
import { assertUUID } from "~/utils/uuid";

import { LikesList } from "./likes-list";
import { deleteLike, importBookmarks } from "./queries";
import { INTENT } from "./types";

export const handle: SDX.Handle = { hydrate: true };

export async function loader({ request, context }: LoaderFunctionArgs) {
	let likes = await Like.list({ db: database(context.db) });
	let locale = await new I18n().getLocale(request);

	return json({
		likes: likes.map((like) => {
			return {
				...like.toJSON(),
				createdAt: like.createdAt.toLocaleString(locale, {
					dateStyle: "medium",
				}),
				updatedAt: like.updatedAt.toLocaleString(locale, {
					dateStyle: "medium",
				}),
			};
		}),
	});
}

export async function action({ request, context }: ActionFunctionArgs) {
	let user = await SessionStorage.requireUser(context, request, "/auth/login");

	let formData = await request.formData();

	let intent = formData.get("intent");

	if (!intent) {
		return json<ValidationErrors>({ error: "Missing intent" }, 400);
	}

	if (formData.get("intent") === INTENT.importBookmarks) {
		try {
			await importBookmarks(context, user);
			throw redirect("/cms/likes");
		} catch (exception) {
			if (exception instanceof Response) throw exception;
			if (exception instanceof Error) {
				return json({ error: exception.message }, 400);
			}
			console.log(exception);
			throw exception;
		}
	}

	if (intent === INTENT.delete) {
		let id = formData.get("id");
		assertUUID(id);

		await deleteLike(context, id);

		return json(null);
	}

	return json<ValidationErrors>({ intent: `Invalid intent ${intent}` }, 400);
}

export default function Component() {
	return (
		<>
			<header className="flex justify-between">
				<h2 className="text-3xl font-bold">Likes</h2>

				<ImportBookmarks />
			</header>

			<SearchForm />
			<LikesList />
		</>
	);
}

function SearchForm() {
	let [searchParams] = useSearchParams();
	let submit = useSubmit();
	let t = useT("cms.likes.search");

	return (
		<Form
			method="get"
			action="/cms/likes"
			onSubmit={(event) => {
				event.preventDefault();
				submit(event.currentTarget);
			}}
			className="flex gap-4"
		>
			<SearchField
				name="q"
				type="text"
				defaultValue={searchParams.get("q") ?? undefined}
				onBlur={(event) => {
					let target = event.currentTarget;
					if (target instanceof HTMLInputElement) submit(target.form);
				}}
				onInput={(event) => {
					let target = event.currentTarget;
					if (target instanceof HTMLInputElement) submit(target.form);
				}}
				className="contents"
			>
				<Label className="sr-only">{t("label")}</Label>
				<Input className="rounded-md border-2 border-blue-600 px-3 py-1" />
			</SearchField>

			<Button
				type="submit"
				className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
			>
				{t("cta")}
			</Button>
		</Form>
	);
}

function ImportBookmarks() {
	let submit = useSubmit();
	let actionData = useActionData<typeof action>();
	let t = useT("cms.likes.import");

	return (
		<Form
			method="post"
			onSubmit={(event) => {
				event.preventDefault();
				submit(event.currentTarget);
			}}
			validationErrors={actionData ?? undefined}
		>
			{actionData?.error ? <span>{actionData.error}</span> : null}
			<input type="hidden" name="intent" value={INTENT.importBookmarks} />
			<Button
				type="submit"
				className="block flex-shrink-0 rounded-md border-2 border-blue-600 bg-blue-100 px-4 py-2 text-center text-base font-medium text-blue-900"
			>
				{t("cta")}
			</Button>
		</Form>
	);
}
