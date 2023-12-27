import type {
	LoaderFunctionArgs,
	MetaDescriptor,
	MetaFunction,
} from "@remix-run/cloudflare";

import { useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils/json-hash";

import { PageHeader } from "~/components/page-header";
import { useT } from "~/helpers/use-i18n.hook";
import { Like } from "~/models/like.server";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";
import { database } from "~/services/db.server";

export function loader({ request, context }: LoaderFunctionArgs) {
	return context.time("routes/bookmarks#loader", async () => {
		void new Logger(context).http(request);

		let likes = await Like.list({ db: database(context.db) });

		return jsonHash({
			likes: likes.map((like) => {
				return { title: like.title, url: like.url.toString() };
			}),
			async meta(): Promise<MetaDescriptor[]> {
				let t = await new I18n().getFixedT(request);

				return [{ title: t("bookmarks.meta.title") }];
			},
		});
	});
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) return [];
	return data.meta;
};

export default function Component() {
	let { likes } = useLoaderData<typeof loader>();
	let t = useT("likes");

	return (
		<section className="mx-auto max-w-screen-sm space-y-2">
			<PageHeader t={t} />

			<main>
				<ul className="space-y-2">
					{likes.map((like) => (
						<li key={like.url} className="list-inside list-disc">
							<a href={like.url} rel="nofollow noreferer">
								{like.title}
							</a>
						</li>
					))}
				</ul>
			</main>
		</section>
	);
}
