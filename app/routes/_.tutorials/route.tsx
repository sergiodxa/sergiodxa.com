import type {
	MetaFunction,
	MetaDescriptor,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { useLoaderData } from "@remix-run/react";
import { jsonHash } from "remix-utils/json-hash";
import { z } from "zod";

import { PageHeader } from "~/components/page-header";
import { Subscribe } from "~/components/subscribe";
import { useT } from "~/helpers/use-i18n.hook";
import { useUser } from "~/helpers/use-user.hook";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { Link } from "~/ui/Link";

import { queryTutorials } from "./queries";

export function loader({ request, context }: LoaderFunctionArgs) {
	return context.time("routes/tutorials#loader", async () => {
		void new Logger(context).http(request);

		let url = new URL(request.url);

		let query =
			z
				.string()
				.transform((v) => v.toLowerCase().trim())
				.nullable()
				.parse(url.searchParams.get("q")) ?? "";

		let tutorials = await queryTutorials(context, query);

		let headers = new Headers({
			"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
		});

		return jsonHash(
			{
				tutorials: tutorials.map((tutorial) => {
					return {
						path: tutorial.path,
						title: tutorial.title,
					};
				}),
				async meta(): Promise<MetaDescriptor[]> {
					let t = await new I18n().getFixedT(request);

					let meta: MetaDescriptor[] = [];

					if (query === "") {
						meta.push({ title: t("tutorials.meta.title.default") });
					} else {
						meta.push({
							title: t("tutorials.meta.title.search", {
								query: decodeURIComponent(query),
							}),
						});
					}

					meta.push({
						tagName: "link",
						rel: "alternate",
						type: "application/rss+xml",
						href: "/tutorials.rss",
					});

					meta.push({
						tagName: "link",
						rel: "canonical",
						href: new URL("/tutorials", url).toString(),
					});

					return meta;
				},
			},
			{ headers },
		);
	});
}

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta ?? [];

export default function Component() {
	let t = useT("tutorials");

	let user = useUser();

	return (
		<main className="mx-auto max-w-screen-sm space-y-2">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
				<PageHeader t={t} />
				{user?.role === "admin" && (
					<Form method="get" action="/cms/tutorials/new">
						<Button type="submit" variant="primary">
							Write
						</Button>
					</Form>
				)}
			</div>

			<div className="flex flex-col gap-y-4">
				<Subscribe t={t} />

				<List />
			</div>
		</main>
	);
}

function List() {
	let { tutorials } = useLoaderData<typeof loader>();
	return (
		<ul className="h-feed space-y-2">
			{tutorials.map((tutorial) => (
				<li key={tutorial.path} className="h-entry list-inside list-disc">
					<Link href={tutorial.path} prefetch="intent" className="u-url">
						{tutorial.title}
					</Link>
				</li>
			))}
		</ul>
	);
}
