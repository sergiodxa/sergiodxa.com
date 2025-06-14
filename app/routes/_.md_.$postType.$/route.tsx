import { z } from "zod";
import { notFound } from "~/helpers/response";
import type { Route } from "./+types/route";
import { queryArticle, queryTutorial } from "./queries";

export async function loader({ params }: Route.LoaderArgs) {
	let result = z
		.object({ postType: z.enum(["articles", "tutorials"]), slug: z.string() })
		.safeParse({ postType: params.postType, slug: params["*"] });

	if (!result.success) throw notFound(result.error);

	let { postType, slug } = result.data;

	if (postType === "articles") {
		return new Response(await queryArticle(slug), {
			headers: { "Content-Type": "text/markdown; charset=utf-8" },
		});
	}

	if (postType === "tutorials") {
		return new Response(await queryTutorial(slug), {
			headers: { "Content-Type": "text/markdown; charset=utf-8" },
		});
	}

	throw new Error("Invalid post type");
}
