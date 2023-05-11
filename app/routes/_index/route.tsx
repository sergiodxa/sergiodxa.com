import type { LoaderArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { Feed } from "~/components/feed";
import { PageHeader } from "~/components/page-header";
import { useT } from "~/helpers/use-i18n.hook";

export function loader({ request, context }: LoaderArgs) {
	return context.time("routes/index#loader", async () => {
		void context.services.log.http(request);

		let headers = new Headers({
			"cache-control": "max-age=60, s-maxage=120, stale-while-revalidate",
		});

		let { notes, bookmarks, tutorials } = await context.services.feed.perform();

		return json({ notes, bookmarks, tutorials }, { headers });
	});
}

export default function Index() {
	let { notes, bookmarks } = useLoaderData<typeof loader>();
	let t = useT("translation", "home");

	let feed = [
		...notes.map((note) => {
			return {
				id: String(note.id),
				type: "article",
				payload: {
					title: note.title,
					link: `/articles/${note.path}`,
					createdAt: new Date(note.created_at),
				},
			} as const;
		}),
		...bookmarks.map((bookmark) => {
			return {
				id: String(bookmark.id),
				type: "bookmark",
				payload: {
					title: bookmark.title,
					link: bookmark.url,
					createdAt: new Date(bookmark.created_at),
				},
			} as const;
		}),
	].sort(
		(a, b) => b.payload.createdAt.getTime() - a.payload.createdAt.getTime()
	);

	return (
		<main className="mx-auto flex max-w-screen-sm flex-col gap-8">
			<PageHeader t={t} />

			<Feed t={t} items={feed} />
		</main>
	);
}
