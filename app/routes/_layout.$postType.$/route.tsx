import type {
	LinksFunction,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/cloudflare";

import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import dark from "prism-theme-github/themes/prism-theme-github-copilot.css";
import light from "prism-theme-github/themes/prism-theme-github-light.css";
import { z } from "zod";

import { Redirects } from "~/modules/redirects.server";

import { ArticleView } from "./article-view";
import { queryArticle, queryTutorial } from "./queries";
import { TutorialView } from "./tutorial-view";

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: light, media: "(prefers-color-scheme: light)" },
	{ rel: "stylesheet", href: dark, media: "(prefers-color-scheme: dark)" },
];

export async function loader({ request, params, context }: LoaderFunctionArgs) {
	let result = z
		.object({ postType: z.enum(["articles", "tutorials"]), slug: z.string() })
		.safeParse({ postType: params.postType, slug: params["*"] });

	if (!result.success) {
		throw new Error("Invalid post type", { cause: result.error });
	}

	let { postType, slug } = result.data;

	if (postType === "articles") {
		try {
			let redirects = new Redirects(context);
			let articleRedirect = await redirects.show(slug);
			if (articleRedirect) throw redirect(articleRedirect.to);
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error(error);
		}

		return json(await queryArticle(context, request, slug));
	}

	if (postType === "tutorials") {
		return json(await queryTutorial(context, request, slug));
	}

	throw new Error("Invalid post type");
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return data?.meta ?? [];
};

export default function Component() {
	let { postType } = useLoaderData<typeof loader>();
	if (postType === "articles") return <ArticleView />;
	if (postType === "tutorials") return <TutorialView />;
	return null;
}
