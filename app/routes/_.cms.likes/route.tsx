import type { ValidationErrors } from "@react-types/shared";
import { badRequest, ok } from "~/helpers/response";
import { getDB } from "~/middleware/drizzle";
import { getLocale } from "~/middleware/i18next";
import { Like } from "~/models/like.server";
import { assertUUID } from "~/utils/uuid";
import type { Route } from "./+types/route";
import { LikesList } from "./components/likes-list";
import { deleteLike } from "./queries";
import { INTENT } from "./types";

export async function loader(_: Route.LoaderArgs) {
	let likes = await Like.list({ db: getDB() });
	let locale = getLocale();

	return ok({
		likes: likes.map((like) => {
			return {
				id: like.id,
				title: like.title,
				url: like.url,
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

export async function action({ request }: Route.ActionArgs) {
	let formData = await request.formData();
	let intent = formData.get("intent");

	if (!intent) {
		return badRequest<ValidationErrors>({ error: "Missing intent" });
	}

	if (intent === INTENT.delete) {
		let id = formData.get("id");
		assertUUID(id);

		await deleteLike(id);

		return ok(null);
	}

	return badRequest<ValidationErrors>({ intent: `Invalid intent ${intent}` });
}

export default function Component({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<header className="flex justify-between">
				<h2 className="text-3xl font-bold">Likes</h2>
			</header>

			<LikesList likes={loaderData.likes} />
		</>
	);
}
