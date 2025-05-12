import type { AppLoadContext } from "@remix-run/cloudflare";
import type { UUID } from "~/utils/uuid";

import { Like } from "~/models/like.server";
import { database } from "~/services/db.server";

export async function deleteLike(context: AppLoadContext, id: UUID) {
	let db = database(context.db);
	await Like.destroy({ db }, id);
}
