import dark from "prism-theme-github/themes/prism-theme-github-copilot.css?url";
import light from "prism-theme-github/themes/prism-theme-github-light.css?url";
import { isRouteErrorResponse, redirect } from "react-router";
import { z } from "zod";
import { notFound, ok } from "~/helpers/response";
import { getBindings } from "~/middleware/bindings";
import { measure } from "~/middleware/server-timing";
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
		let bindings = await measure(
			"_.$postType.$",
			"_.$postType.$.tsx#redirectsMiddleware#getBindings",
			() => Promise.resolve(getBindings()),
		);

		let data = await measure(
			"_$postType.$",
			"_.$postType.$.tsx#redirectsMiddleware#kv.redirects.get",
			() => bindings.kv.redirects.get(params["*"], "json"),
		);

		let redirectConfig = z
			.object({ from: z.string(), to: z.string() })
			.nullish()
			.parse(data);

		if (!redirectConfig) return await next();
		if (redirectConfig.from === `/${params.postType}/${params["*"]}`) {
			throw redirect(redirectConfig.to);
		}

		return await next();
	},
];

export async function loader({ request, params }: Route.LoaderArgs) {
	let result = z
		.object({ postType: z.enum(["articles", "tutorials"]), slug: z.string() })
		.safeParse({ postType: params.postType, slug: params["*"] });

	if (!result.success) throw notFound(result.error);

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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
