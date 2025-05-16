import { MarkdownView } from "~/components/markdown";
import { Support } from "~/components/support";

type Post = Awaited<ReturnType<typeof import("../queries").queryArticle>>;

export function ArticleView({ post }: { post: Post }) {
	if (post.postType !== "articles") return null;

	return (
		<article className="mx-auto mb-8 flex max-w-screen-md flex-col gap-8">
			<div className="prose prose-blue mx-auto w-full max-w-prose space-y-8 sm:prose-lg dark:prose-invert">
				<MarkdownView content={post.article.body} />
			</div>
			<Support />
		</article>
	);
}
