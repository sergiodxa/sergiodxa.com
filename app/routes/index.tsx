import type { LoaderArgs } from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { MarkdownView } from "~/components/markdown";
import { GitHubService } from "~/services/gh.server";
import { parseMarkdown } from "~/services/md.server";

export async function loader({ context }: LoaderArgs) {
	let gh = new GitHubService(context!.env.GITHUB_TOKEN);
	let content = await gh.getArticleContent("about");
	return json({ article: parseMarkdown(atob(content)) });
}

export let handle: SDX.Handle = { hydrate: true };

export default function Index() {
	let { article } = useLoaderData<typeof loader>();
	return (
		<article className="prose mx-auto my-8">
			<MarkdownView content={article} />
		</article>
	);
}
