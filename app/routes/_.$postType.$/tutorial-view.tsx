import type { loader } from "./route";
import type { SerializeFrom } from "@remix-run/cloudflare";

import { Await, useAsyncValue, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { Trans } from "react-i18next";

import { MarkdownView } from "~/components/markdown";
import { Support } from "~/components/support";
import { useT } from "~/helpers/use-i18n.hook";
import { useUser } from "~/helpers/use-user.hook";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { Link } from "~/ui/Link";
import { cn } from "~/utils/cn";

type LoaderData = SerializeFrom<typeof loader>;
type RecommendationsList = Extract<
	Awaited<LoaderData>,
	{ postType: "tutorials" }
>["recommendations"];

export function TutorialView() {
	let loaderData = useLoaderData<typeof loader>();
	let t = useT("tutorial");
	let user = useUser();

	if (loaderData.postType !== "tutorials") return null;

	return (
		<article className="mx-auto flex max-w-screen-md flex-col gap-8 pb-14">
			<div className="prose prose-blue mx-auto w-full max-w-prose space-y-8 sm:prose-lg dark:prose-invert">
				<Versions />

				{user?.role === "admin" && (
					<Form
						method="get"
						action={`/cms/tutorials/${loaderData.tutorial.id}`}
					>
						<Button type="submit" variant="primary">
							Edit
						</Button>
					</Form>
				)}

				<div>
					<header className="gap-4 md:flex md:items-start md:justify-between">
						<h1>
							<small className="block text-xl text-blue-500">
								{t("header.eyebrown")}
							</small>
							{loaderData.tutorial.title}
						</h1>
					</header>

					<MarkdownView content={loaderData.tutorial?.content} />
				</div>
			</div>

			<Support />

			<Suspense fallback={null}>
				<Await resolve={loaderData.recommendations} errorElement={null}>
					<footer>
						<Recommendations />
					</footer>
				</Await>
			</Suspense>
		</article>
	);
}

function Versions() {
	let loaderData = useLoaderData<typeof loader>();
	let t = useT("tutorial");

	if (loaderData.postType !== "tutorials") return null;

	let { tutorial } = loaderData;

	if (!tutorial || tutorial.tags.length === 0) return null;

	return (
		<section className="not-prose flex flex-wrap items-center gap-1">
			<h2 className="text-xs font-bold">{t("tags")}</h2>

			<ul className="contents">
				{tutorial.tags.map((tag) => {
					let searchParams = new URLSearchParams();
					searchParams.set("q", `tech:${tag}`);

					let to = `/?${searchParams.toString()}`;

					return (
						<li key={tag} className="contents">
							<Link
								href={to}
								className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 no-underline visited:text-blue-800 dark:bg-blue-900 dark:text-blue-200 dark:visited:text-blue-300"
							>
								{tag}
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

function Recommendations() {
	let recommendations = useAsyncValue() as RecommendationsList;
	let t = useT("tutorial.related");

	if (!recommendations || recommendations.length === 0) return null;

	return (
		<section className="not-prose mt-4 space-y-4">
			<header className="border-b border-zinc-200 pb-5">
				<h2 className="text-lg font-medium leading-6 text-zinc-900 dark:text-zinc-100">
					{t("title")}
				</h2>
			</header>

			<div
				className={cn("grid grid-cols-1 gap-4", {
					"md:grid-cols-1": recommendations.length === 1,
					"md:grid-cols-2": recommendations.length === 2,
					"md:grid-cols-3": recommendations.length >= 3,
				})}
			>
				{recommendations.map(({ title, slug, tag }) => {
					let searchParams = new URLSearchParams();
					searchParams.set("q", `tech:${tag}`);

					let to = `/tutorials?${searchParams.toString()}`;

					return (
						<div key={slug} className="flex flex-col gap-2">
							<Link href={`/tutorials/${slug}`} className="line-clamp-2 block">
								<p className="text-xl font-semibold">{title}</p>
							</Link>

							<Trans
								t={t}
								parent="p"
								className="py-0.5 text-sm font-medium"
								i18nKey="reason"
								values={{ tag }}
								components={{
									anchor: <Link href={to} />,
								}}
							/>
						</div>
					);
				})}
			</div>
		</section>
	);
}
