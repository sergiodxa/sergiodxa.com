import type {
	LoaderFunctionArgs,
	MetaDescriptor,
	MetaFunction,
} from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { PageHeader } from "~/components/page-header";
import { useT } from "~/helpers/use-i18n.hook";
import { useUser } from "~/helpers/use-user.hook";
import { Glossary } from "~/models/glossary.server";
import { I18n } from "~/modules/i18n.server";
import { Logger } from "~/modules/logger.server";
import { database } from "~/services/db.server";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";

export async function loader({ request, context }: LoaderFunctionArgs) {
	void new Logger(context).http(request);
	let locale = await new I18n().getLocale(request);

	let db = database(context.db);

	let glossary = await Glossary.list({ db });
	glossary = glossary.sort((a, b) => a.term.localeCompare(b.term, locale));

	return json({
		glossary: glossary.map((g) => g.toJSON()),
		meta: [
			{ title: "Glossary of sergiodxa" },
			{
				name: "description",
				content: "My definition of terms used in web dev.",
			},
			{
				tagName: "link",
				rel: "canonical",
				href: new URL("/glossary", request.url).toString(),
			},
		] satisfies MetaDescriptor[],
	});
}

export const meta: MetaFunction<typeof loader> = ({ data }) => data?.meta ?? [];

export default function Component() {
	let { glossary } = useLoaderData<typeof loader>();
	let t = useT("glossary");

	let user = useUser();

	return (
		<main className="mx-auto mb-8 flex max-w-screen-sm flex-col gap-y-8">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
				<PageHeader t={t} />

				{user?.role === "admin" && (
					<Form method="get" action="/cms/glossary">
						<Button type="submit" variant="primary">
							Define
						</Button>
					</Form>
				)}
			</div>

			<dl className="flex flex-col">
				{glossary.map(({ id, slug, title, term, definition }) => (
					<div
						key={id}
						id={slug}
						className="py-4 target:scroll-m-4 target:rounded-md target:border-2 target:border-zinc-500 target:border-opacity-50 target:bg-zinc-100 target:p-4 target:shadow-md target:dark:border-zinc-400 target:dark:border-opacity-50 target:dark:bg-zinc-800 target:dark:text-zinc-100 target:dark:shadow-none"
					>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
							<dt className="text-xl font-bold">
								<a href={`#${slug}`}>
									{term}{" "}
									{title ? (
										<small className="text-sm text-zinc-700 dark:text-zinc-400">
											(aka {title})
										</small>
									) : null}
								</a>
							</dt>

							{user?.role === "admin" && (
								<Form method="get" action={`/cms/glossary/${id}`}>
									<Button type="submit" variant="primary">
										Edit
									</Button>
								</Form>
							)}
						</div>
						<dd>{definition}</dd>
					</div>
				))}
			</dl>
		</main>
	);
}
