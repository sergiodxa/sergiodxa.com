import { cacheHeader } from "pretty-cache-header";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { PageHeader } from "~/components/page-header";
import { Subscribe } from "~/components/subscribe";
import { ok } from "~/helpers/response";
import { getI18nextInstance } from "~/middleware/i18next";
import type { Route } from "./+types/route";
import { FeedList } from "./feed";
import { queryFeed } from "./queries";

export const meta: Route.MetaFunction = ({ data }) => data?.meta ?? [];

export async function loader({ request }: Route.LoaderArgs) {
	let headers = new Headers({
		"cache-control": cacheHeader({
			maxAge: "60s",
			sMaxage: "120s",
			staleIfError: "60s",
			staleWhileRevalidate: "60s",
		}),
	});

	let url = new URL(request.url);
	let query = z
		.string()
		.transform((v) => v.toLowerCase())
		.nullable()
		.parse(url.searchParams.get("q"));

	let { t } = getI18nextInstance();

	return ok(
		{
			items: await queryFeed(query ?? ""),
			meta: [
				{
					title: query
						? t("home.meta.title.search", { query })
						: t("home.meta.title.default"),
				},
				{
					name: "og:title",
					content: query
						? t("home.meta.title.search", { query })
						: t("home.meta.title.default"),
				},
			] satisfies Route.MetaDescriptors,
		},
		{ headers },
	);
}

export default function Component({ loaderData }: Route.ComponentProps) {
	let { t } = useTranslation("translation", { keyPrefix: "home" });

	return (
		<main className="mx-auto flex max-w-screen-sm flex-col gap-8">
			<PageHeader t={t} />

			<div className="flex flex-col gap-y-4">
				<Subscribe t={t} />

				<FeedList t={t} items={loaderData.items} />
			</div>
		</main>
	);
}
