import type {
	SerializeFrom,
	MetaDescriptor,
	MetaFunction,
	LoaderFunctionArgs,
} from "@remix-run/cloudflare";

import { redirect, defer } from "@remix-run/cloudflare";
import { Await, Link, useAsyncValue, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { Trans } from "react-i18next";
import { z } from "zod";

import { MarkdownView } from "~/components/markdown";
import { Support } from "~/components/support";
import { useT } from "~/helpers/use-i18n.hook";
import { useUser } from "~/helpers/use-user.hook";
import { Tutorial } from "~/models/tutorial.server";
import { I18n } from "~/modules/i18n.server";
import { database } from "~/services/db.server";
import { cn } from "~/utils/cn";

type LoaderData = SerializeFrom<typeof loader>;
type RecommendationsList = Awaited<LoaderData["recommendations"]>;

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	return context.time("routes/tutorials.$slug#loader", async () => {
		let i18n = new I18n();

		let locale = await i18n.getLocale(request);
		let { slug } = z.object({ slug: z.string() }).parse(params);

		if (slug.endsWith(".md")) {
			slug = slug.slice(0, -3);
			throw redirect(`/tutorials/${slug}`);
		}

		let db = database(context.db);
		let tutorial = await Tutorial.show({ db }, slug);

		let [recommendations, author, wordCount] = await Promise.all([
			tutorial.recommendations({ db }).then((tutorials) => {
				return tutorials.map((tutorial) => {
					return {
						title: tutorial.title,
						slug: tutorial.slug,
						tag: tutorial.tags.at(0),
					};
				});
			}),
			tutorial.author,
			tutorial.wordCount,
		]);

		let t = await i18n.getFixedT(request);

		return defer({
			tutorial: {
				id: tutorial.id,
				slug: tutorial.slug,
				tags: tutorial.tags,
				title: tutorial.title,
				content: tutorial.renderable,
			},
			recommendations,
			meta: getMeta(),
		});

		function getMeta(): MetaDescriptor[] {
			let title = t("tutorial.document.title", { title: tutorial.title });

			return [
				{ title },
				{ name: "description", content: tutorial.excerpt },
				{ property: "og:title", content: title },
				{ property: "og:type", content: "article" },
				{ property: "og:url", content: request.url },
				{ property: "og:site_name", content: "Sergio Xalambrí" },
				{ property: "og:locale", content: locale },
				{ property: "twitter:card", content: "summary" },
				{ property: "twitter:creator", content: "@sergiodxa" },
				{ property: "twitter:site", content: "@sergiodxa" },
				{ property: "twitter:title", content: title },
				{
					"script:ld+json": {
						"@context": "https://schema.org",
						"@type": "Article",
						headline: tutorial.title,
						description: tutorial.excerpt,
						author: {
							"@type": "Person",
							name: author.displayName,
							url: "https://sergiodxa.com/about",
						},
						wordCount,
						datePublished: tutorial.createdAt.toISOString(),
						dateModified: tutorial.updatedAt.toISOString(),
					},
				},
			];
		}
	});
}

export let meta: MetaFunction<typeof loader> = ({ data }) => {
	return data?.meta ?? [];
};

export default function Component() {
	let { tutorial, recommendations } = useLoaderData<typeof loader>();

	if (!tutorial) return null;

	return (
		<article className="mx-auto flex max-w-screen-md flex-col gap-8 pb-14">
			<div className="prose prose-blue mx-auto w-full max-w-prose space-y-8 sm:prose-lg">
				<Versions />
				<div>
					<Header />
					<MarkdownView content={tutorial?.content} />
				</div>
			</div>

			<Support />

			<Suspense fallback={null}>
				<Await resolve={recommendations} errorElement={null}>
					<footer>
						<Recommendations />
					</footer>
				</Await>
			</Suspense>
		</article>
	);
}

function Header() {
	let { tutorial } = useLoaderData<typeof loader>();
	let user = useUser();
	let t = useT("tutorial.header");

	let editUrl = new URL(`https://sergiodxa.com/cms/tutorials/${tutorial.id}`);

	return (
		<header className="gap-4 md:flex md:items-start md:justify-between">
			<h1>
				<small className="block text-xl text-blue-500">{t("eyebrown")}</small>
				{tutorial.title}
			</h1>
			{user ? (
				<div className="flex flex-shrink-0">
					<a
						href={editUrl.toString()}
						className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						{t("edit")}
					</a>

					{/* <button
						type="button"
						className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						Publish
					</button> */}
				</div>
			) : null}
		</header>
	);
}

function Versions() {
	let { tutorial } = useLoaderData<typeof loader>();
	let t = useT("tutorial");

	if (!tutorial || tutorial.tags.length === 0) return null;

	return (
		<section className="not-prose flex flex-wrap items-center gap-1">
			<h2 className="text-xs font-bold">{t("tags")}</h2>

			<ul className="contents">
				{tutorial.tags.map((tag) => {
					let searchParams = new URLSearchParams();
					searchParams.set("q", `tech:${tag}`);

					let to = `/tutorials?${searchParams.toString()}`;

					return (
						<li key={tag} className="contents">
							<Link
								to={to}
								className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 no-underline visited:text-blue-800"
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
			<header className="border-b border-gray-200 pb-5">
				<h2 className="text-lg font-medium leading-6 text-gray-900">
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
							<Link
								to={`/tutorials/${slug}`}
								className="line-clamp-2 block text-blue-900 underline visited:text-violet-900"
							>
								<p className="text-xl font-semibold">{title}</p>
							</Link>

							<Trans
								t={t}
								parent="p"
								className="py-0.5 text-sm font-medium"
								i18nKey="reason"
								values={{ tag }}
								components={{
									anchor: (
										// eslint-disable-next-line jsx-a11y/anchor-has-content
										<Link
											to={to}
											className="text-blue-800 underline visited:text-violet-800"
										/>
									),
								}}
							/>
						</div>
					);
				})}
			</div>
		</section>
	);
}