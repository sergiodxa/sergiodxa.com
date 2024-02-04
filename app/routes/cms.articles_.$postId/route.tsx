import type {
	DataFunctionArgs,
	MetaDescriptor,
	MetaFunction,
} from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { Article } from "~/models/article.server";
import { I18n } from "~/modules/i18n.server";
import { Editor } from "~/routes/components.editor/route";
import { database } from "~/services/db.server";
import { assertUUID } from "~/utils/uuid";

export const handle: SDX.Handle = { hydrate: true };

export async function loader({ request, params, context }: DataFunctionArgs) {
	let t = await new I18n().getFixedT(request);

	let meta: MetaDescriptor[] = [{ title: t("write.title") }];

	let postId = params.postId;
	assertUUID(postId);

	let db = database(context.db);

	let article = await Article.findById({ db }, postId);

	return json({ meta, article: article.toJSON() });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta ?? [];

export default function Component() {
	let loaderData = useLoaderData<typeof loader>();

	return (
		<main className="mx-auto w-full max-w-screen-xl">
			<Editor key="editor" defaultContent={loaderData.article.content} />
		</main>
	);
}
