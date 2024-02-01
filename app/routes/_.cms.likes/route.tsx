import type { ValidationErrors } from "@react-types/shared";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";

import { Like } from "~/models/like.server";
import { I18n } from "~/modules/i18n.server";
import { SessionStorage } from "~/modules/session.server";
import { database } from "~/services/db.server";
import { assertUUID } from "~/utils/uuid";

import { ImportBookmarks } from "./import-bookmarks";
import { LikesList } from "./likes-list";
import { deleteLike, importBookmarks } from "./queries";
import { INTENT } from "./types";

export const handle: SDX.Handle = { hydrate: true };

export async function loader({ request, context }: LoaderFunctionArgs) {
	await SessionStorage.requireUser(context, request, "/auth/login");
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

	if (formData.get("intent") === INTENT.import) {
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

			<LikesList />
		</>
	);
}
