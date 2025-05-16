import { useTranslation } from "react-i18next";
import { z } from "zod";
import { PageHeader } from "~/components/page-header";
import { Subscribe } from "~/components/subscribe";
import { ok } from "~/helpers/response";
import { useUser } from "~/hooks/use-user";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { Link } from "~/ui/Link";
import type { Route } from "./+types/route";
import { getMeta, queryTutorials } from "./queries";

export const meta: Route.MetaFunction = ({ data }) => data?.meta ?? [];

export async function loader({ request }: Route.LoaderArgs) {
	let url = new URL(request.url);

	let query =
		z
			.string()
			.transform((v) => v.toLowerCase().trim())
			.nullable()
			.parse(url.searchParams.get("q")) ?? "";

	let tutorials = await queryTutorials(query);

	let headers = new Headers({
		"cache-control": "max-age=1, s-maxage=1, stale-while-revalidate",
	});

	return ok(
		{
			tutorials: tutorials.map((tutorial) => {
				return {
					path: tutorial.path,
					title: tutorial.title,
				};
			}),
			meta: getMeta(url, query),
		},
		{ headers },
	);
}

export default function Component({ loaderData }: Route.ComponentProps) {
	let { t } = useTranslation("translation", { keyPrefix: "tutorials" });
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

				<ul className="h-feed space-y-2">
					{loaderData.tutorials.map((tutorial) => (
						<li key={tutorial.path} className="h-entry list-inside list-disc">
							<Link href={tutorial.path} prefetch="intent" className="u-url">
								{tutorial.title}
							</Link>
						</li>
					))}
				</ul>
			</div>
		</main>
	);
}
