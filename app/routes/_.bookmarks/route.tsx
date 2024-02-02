import type {
	LoaderFunctionArgs,
	MetaDescriptor,
	MetaFunction,
} from "@remix-run/cloudflare";

import { useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils/json-hash";

import { PageHeader } from "~/components/page-header";
import { Subscribe } from "~/components/subscribe";
import { useT } from "~/helpers/use-i18n.hook";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";
import { Link } from "~/ui/Link";

import { queryBookmarks } from "./query";

export function loader({ request, context }: LoaderFunctionArgs) {
	return context.time("routes/bookmarks#loader", async () => {
		void new Logger(context).http(request);

		let likes = await queryBookmarks(context);

		return jsonHash({
			likes,
			async meta(): Promise<MetaDescriptor[]> {
				let t = await new I18n().getFixedT(request);

				return [
					{ title: t("bookmarks.meta.title") },
					{
						tagName: "link",
						rel: "alternate",
						type: "application/rss+xml",
						href: "/bookmarks.rss",
					},
				];
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
	let t = useT("bookmarks");

	return (
		<main className="mx-auto max-w-screen-sm space-y-2">
			<PageHeader t={t} />

			<div className="flex flex-col gap-y-4">
				<Subscribe t={t} />

				<ul className="space-y-2">
					{likes.map((like) => {
						return (
							<li key={like.url} className="list-inside list-disc">
								<Link href={like.url} rel="nofollow noreferer">
									{like.title}
								</Link>

								{like.cached && (
									<>
										{" - "}
										<Link
											href={like.cached}
											rel="nofollow noreferer"
											className="text-sm"
										>
											(Wayback Machine)
										</Link>
									</>
								)}
							</li>
						);
					})}
				</ul>
			</div>
		</main>
	);
}
