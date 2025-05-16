import dark from "prism-theme-github/themes/prism-theme-github-copilot.css?url";
import light from "prism-theme-github/themes/prism-theme-github-light.css?url";
import { redirect } from "react-router";
import { z } from "zod";
import { ok } from "~/helpers/response";
import { getBindings } from "~/middleware/bindings";
import type { Route } from "./+types/route";
import { ArticleView } from "./components/article-view";
import { TutorialView } from "./components/tutorial-view";
import { queryArticle, queryTutorial } from "./queries";

export const meta: Route.MetaFunction = ({ data }) => data?.meta ?? [];

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: light, media: "(prefers-color-scheme: light)" },
	{ rel: "stylesheet", href: dark, media: "(prefers-color-scheme: dark)" },
];

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
	async function redirectsMiddleware({ params }, next) {
		let bindings = getBindings();
		let redirectConfig = await z
			.object({ from: z.string(), to: z.string() })
			.nullish()
			.promise()
			.parse(bindings.kv.redirects.get(params.postType, "json"));
		if (!redirectConfig) return await next();
		throw redirect(redirectConfig.to);
	},
];

export async function loader({ request, params }: Route.LoaderArgs) {
	let result = z
		.object({ postType: z.enum(["articles", "tutorials"]), slug: z.string() })
		.safeParse({ postType: params.postType, slug: params["*"] });

	if (!result.success) {
		throw new Error("Invalid post type", { cause: result.error });
	}

	let { postType, slug } = result.data;

	if (postType === "articles") return ok(await queryArticle(request, slug));
	if (postType === "tutorials") return ok(await queryTutorial(request, slug));

	throw new Error("Invalid post type");
}

export default function Component({ loaderData }: Route.ComponentProps) {
	if (loaderData.postType === "articles") {
		return <ArticleView post={loaderData} />;
	}

	if (loaderData.postType === "tutorials") {
		return <TutorialView post={loaderData} />;
	}

	// @ts-expect-error - postType should be never, but you never know
	throw new Error(`Invalid post type: ${loaderData.postType ?? "Missing"}`);
}
