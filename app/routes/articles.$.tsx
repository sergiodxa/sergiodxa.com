import type {
	LinksFunction,
	LoaderArgs,
	MetaFunction,
} from "@remix-run/cloudflare";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";

import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { MarkdownView } from "~/components/markdown";
import { CollectedNotesService } from "~/services/cn.server";
import { i18n } from "~/services/i18n.server";
import { parseMarkdown } from "~/services/md.server";
import highlightStyles from "~/styles/highlight.css";

export let links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: highlightStyles }];
};

export async function loader({ request, context, params }: LoaderArgs) {
	let path = params["*"];

	if (!path) return redirect("/articles");

	let cn = new CollectedNotesService(
		context!.env.CN_EMAIL,
		context!.env.CN_TOKEN,
		context!.env.CN_SITE
	);

	let note = await cn.readNote(path);

	let body = parseMarkdown(note.body);

	let t = await i18n.getFixedT(request);

	let meta = {
		title: t("{{note}} - Sergio Xalambrí", { note: note.title }),
		description: note.headline,
	};

	return json({ body, meta });
}

export let meta: MetaFunction = ({ data }) => {
	if (!data) return {};
	let { meta } = data as UseDataFunctionReturn<typeof loader>;
	return meta;
};

export default function Article() {
	let { body } = useLoaderData<typeof loader>();

	return (
		<section className="space-y-4">
			<article className="dark:prose-dark prose prose-blue mx-auto sm:prose-lg">
				<MarkdownView content={body} />
			</article>
		</section>
	);
}
