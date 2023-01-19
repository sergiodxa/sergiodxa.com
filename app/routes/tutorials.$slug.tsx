import type { LoaderArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { z } from "zod";

import { MarkdownView } from "~/components/markdown";
import { useT } from "~/helpers/use-i18n.hook";
import { parseMarkdown } from "~/md";

export async function loader({ params, context }: LoaderArgs) {
	let slug = z.string().parse(params.slug);

	let result = await context.services.tutorials.read.perform(slug);

	if (!result) return json({ tutorial: null, related: null }, { status: 404 });

	let headers = new Headers();

	return json(
		{
			tutorial: {
				...result.tutorial,
				content: parseMarkdown(result.tutorial.content),
			},
			related: result.related,
		},
		{ headers }
	);
}

export default function Component() {
	let { tutorial } = useLoaderData<typeof loader>();

	if (!tutorial) return null;

	return (
		<article className="dark:prose-dark prose prose-blue mx-auto divide-y divide-gray-400 sm:prose-lg">
			<div className="contents">
				<header className="-mb-5 flex flex-col gap-4">
					<h1 className="order-last">{tutorial.title}</h1>

					<Versions />
				</header>

				<MarkdownView content={tutorial?.content} />
			</div>

			<footer>
				<RelatedTutorials />
			</footer>
		</article>
	);
}

function Versions() {
	let { tutorial } = useLoaderData<typeof loader>();
	let t = useT();

	if (!tutorial || tutorial.technologies.length === 0) return null;

	return (
		<section className="not-prose flex flex-wrap items-center gap-1">
			<h2 className="text-xs font-bold">{t("tutorials.technologies")}</h2>

			<ul className="contents">
				{tutorial.technologies.map((tech) => {
					let string = `${tech.name}@${tech.version}`;

					let searchParams = new URLSearchParams();
					searchParams.set("q", `tech:${string}`);

					let to = `/tutorials?${searchParams.toString()}`;

					return (
						<li key={string} className="contents">
							<Link
								to={to}
								className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 no-underline visited:text-blue-800"
							>
								{string}
							</Link>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

function RelatedTutorials() {
	let { related } = useLoaderData<typeof loader>();
	let t = useT();

	if (!related || related.length === 0) return null;

	return (
		<section className="not-prose mt-4 space-y-4">
			<h2 className="text-md font-semibold text-gray-800">
				{t("tutorials.related")}
			</h2>

			<div
				className={clsx("grid gap-4", {
					"grid-cols-1": related.length === 1,
					"grid-cols-2": related.length === 2,
					"grid-cols-3": related.length >= 3,
				})}
			>
				{related.map((tutorial) => {
					return (
						<div key={tutorial.title}>
							<ul className="flex flex-wrap items-center gap-1">
								{tutorial.technologies.map((tech) => {
									let string = `${tech.name}@${tech.version}`;

									let searchParams = new URLSearchParams();
									searchParams.set("q", `tech:${string}`);

									let to = `/tutorials?${searchParams.toString()}`;

									return (
										<li key={string} className="contents">
											<Link
												to={to}
												className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 no-underline visited:text-blue-800"
											>
												{tech.name}
											</Link>
										</li>
									);
								})}
							</ul>

							<Link
								to={`/tutorials/${tutorial.slug}`}
								className="mt-4 block no-underline"
							>
								<p className="text-xl font-semibold text-gray-900">
									{tutorial.title}
								</p>
								<p className="mt-3 text-base text-gray-600">
									{tutorial.content}
								</p>
							</Link>
						</div>
					);
				})}
			</div>
		</section>
	);
}
