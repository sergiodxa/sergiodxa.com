import type {
	LoaderFunctionArgs,
	MetaDescriptor,
	MetaFunction,
} from "@remix-run/cloudflare";

import { useLoaderData } from "@remix-run/react";
import { Trans } from "react-i18next";
import { jsonHash } from "remix-utils/json-hash";

import { PageHeader } from "~/components/page-header";
import { useT } from "~/helpers/use-i18n.hook";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";

import { queryBookmarks } from "./query";

export function loader({ request, context }: LoaderFunctionArgs) {
	return context.time("routes/bookmarks#loader", async () => {
		void new Logger(context).http(request);

		let likes = await queryBookmarks(context);

		return jsonHash({
			likes,
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
		<main className="mx-auto max-w-screen-sm space-y-2">
			<PageHeader t={t} />

			<div className="space-y-4">
				<Subscribe />

				<ul className="space-y-2">
					{likes.map((like) => (
						<li key={like.url} className="list-inside list-disc">
							<a href={like.url} rel="nofollow noreferer">
								{like.title}
							</a>
						</li>
					))}
				</ul>
			</div>
		</main>
	);
}

function Subscribe() {
	let t = useT("bookmarks.subscribe");
	return (
		<Trans
			t={t}
			parent="p"
			className="text-lg text-gray-800"
			i18nKey="cta"
			components={{
				// eslint-disable-next-line jsx-a11y/anchor-has-content
				rss: <a href="/bookmarks.rss" />,
			}}
		/>
	);
}
