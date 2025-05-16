import { useTranslation } from "react-i18next";
import { PageHeader } from "~/components/page-header";
import { Subscribe } from "~/components/subscribe";
import { ok } from "~/helpers/response";
import { getI18nextInstance } from "~/middleware/i18next";
import { Link } from "~/ui/Link";
import type { Route } from "./+types/route";
import { queryBookmarks } from "./query";

export const meta: Route.MetaFunction = ({ data }) => data?.meta ?? [];

export async function loader({ request }: Route.LoaderArgs) {
	let likes = await queryBookmarks();
	let { t } = getI18nextInstance();

	return ok({
		likes,
		meta: [
			{ title: t("bookmarks.meta.title") },
			{
				tagName: "link",
				rel: "alternate",
				type: "application/rss+xml",
				href: "/bookmarks.rss",
			},
			{
				tagName: "link",
				rel: "canonical",
				href: new URL("/bookmarks", request.url).toString(),
			},
		],
	});
}

export default function Component({ loaderData }: Route.ComponentProps) {
	let { t } = useTranslation("translation", { keyPrefix: "bookmarks" });

	return (
		<main className="mx-auto max-w-screen-sm space-y-2">
			<PageHeader t={t} />

			<div className="flex flex-col gap-y-4">
				<Subscribe t={t} />

				<ul className="space-y-2">
					{loaderData.likes.map((like) => {
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
