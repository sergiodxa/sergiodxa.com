import {
	type LoaderFunctionArgs,
	type MetaFunction,
	type MetaDescriptor,
	json,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { PageHeader } from "~/components/page-header";
import { Subscribe } from "~/components/subscribe";
import { useT } from "~/helpers/use-i18n.hook";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";
import { Link } from "~/ui/Link";

import { queryArticles } from "./queries";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);

	let url = new URL(request.url);

	let headers = new Headers({
		"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
	});

	let t = await new I18n().getFixedT(request);

	try {
		let articles = await queryArticles(context);

		return json(
			{
				articles,
				meta: [
					{ title: t("articles.meta.title") },
					{
						tagName: "link",
						rel: "alternate",
						type: "application/rss+xml",
						href: "/articles.rss",
					},
					{
						tagName: "link",
						rel: "canonical",
						href: new URL("/articles", url).toString(),
					},
				] satisfies MetaDescriptor[],
			},
			{ headers },
		);
	} catch (error) {
		if (error instanceof Error) {
			throw json({ message: error.message }, 500);
		}
		throw error;
	}
}

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta ?? [];

export default function Articles() {
	let { articles } = useLoaderData<typeof loader>();
	let t = useT("articles");

	return (
		<main className="mx-auto max-w-screen-sm space-y-2">
			<PageHeader t={t} />

			<div className="flex flex-col gap-y-4">
				<Subscribe t={t} />

				<ul className="space-y-2">
					{articles.map((article) => (
						<li key={article.path} className="list-inside list-disc">
							<Link href={article.path} prefetch="intent">
								{article.title}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</main>
	);
}
