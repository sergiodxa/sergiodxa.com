import type { LoaderArgs } from "@remix-run/cloudflare";
import type { TFunction } from "i18next";

import { defer } from "@remix-run/cloudflare";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { Trans } from "react-i18next";

import { PageHeader } from "~/components/page-header";
import { useT } from "~/helpers/use-i18n.hook";
import { measure } from "~/utils/measure";

export function loader({ request, context }: LoaderArgs) {
	return measure("routes/index#loader", async () => {
		void context.services.log.http(request);

		let headers = new Headers({
			"cache-control": "max-age=60, s-maxage=120, stale-while-revalidate",
		});

		let { notes, bookmarks } = await context.services.feed.perform();

		return defer({ notes, bookmarks }, { headers });
	});
}

export default function Index() {
	let { notes, bookmarks } = useLoaderData<typeof loader>();
	let t = useT("translation", "home");
	return (
		<main className="mx-auto flex max-w-screen-sm flex-col gap-2">
			<PageHeader t={t} />

			<section className="space-y-2 px-0 py-6 md:px-6 md:py-2">
				<header>
					<h2 className="text-xl font-semibold">{t("latestNotes.title")}</h2>
					<p className="text-sm text-gray-900">
						{t("latestNotes.description")}
					</p>
				</header>

				<ul className="space-y-1">
					{notes.map((note) => {
						return (
							<li key={note.id} className="list-inside list-disc">
								<Link to={`articles/${note.path}`} prefetch="intent">
									{note.title}
								</Link>
							</li>
						);
					})}
				</ul>

				<footer className="text-xs text-gray-900">
					<Trans
						t={t}
						i18nKey="latestNotes.footer"
						components={{
							// eslint-disable-next-line jsx-a11y/anchor-has-content
							"link:articles": <Link to="/articles" className="underline" />,
						}}
					/>
				</footer>
			</section>

			<section className="space-y-2 px-0 py-6 md:px-6 md:py-2">
				<header>
					<h2 className="text-xl font-semibold">{t("bookmarks.title")}</h2>
					<p className="text-sm text-gray-900">{t("bookmarks.description")}</p>
				</header>

				<Suspense fallback={<p>{t("bookmarks.loading")}</p>}>
					<Await
						resolve={bookmarks}
						errorElement={<p>{t("bookmarks.error")}</p>}
					>
						{(bookmarks) => {
							return (
								<ul className="space-y-1">
									{bookmarks.map((bookmark) => {
										return (
											<li key={bookmark.id} className="list-inside list-disc">
												<a href={bookmark.url}>{bookmark.title}</a>
											</li>
										);
									})}
								</ul>
							);
						}}
					</Await>
				</Suspense>
			</section>
		</main>
	);
}
