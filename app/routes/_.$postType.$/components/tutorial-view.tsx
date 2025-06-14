import { Suspense } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Await, Link as RemixLink, href, useAsyncValue } from "react-router";
import { MarkdownView } from "~/components/markdown";
import { Support } from "~/components/support";
import { useUser } from "~/hooks/use-user";
import { Button } from "~/ui/Button";
import { Form } from "~/ui/Form";
import { Link } from "~/ui/Link";
import { Tag, TagGroup } from "~/ui/TagGroup";
import { cn } from "~/utils/cn";

type Post = Awaited<ReturnType<typeof import("../queries").queryTutorial>>;
type RecommendationsList = Post["recommendations"];

export function TutorialView({ post }: { post: Post }) {
	let { t } = useTranslation("translation", { keyPrefix: "tutorial" });
	let user = useUser();

	if (post.postType !== "tutorials") return null;

	return (
		<article className="mx-auto flex max-w-screen-md flex-col gap-8 pb-14">
			<div className="prose prose-blue mx-auto w-full max-w-prose space-y-8 sm:prose-lg dark:prose-invert">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
					<Tags
						tags={
							post.tutorial.tags
								? Array.isArray(post.tutorial.tags)
									? post.tutorial.tags
									: [post.tutorial.tags]
								: []
						}
					/>

					{user?.role === "admin" && (
						<Form
							method="get"
							action={href("/cms/tutorials/:postId", {
								postId: post.tutorial.id,
							})}
						>
							<Button type="submit" variant="primary">
								{t("header.edit")}
							</Button>
						</Form>
					)}

					<Form
						method="get"
						reloadDocument
						action={href("/md/:postType/*", {
							postType: "tutorials",
							"*": post.tutorial.slug,
						})}
					>
						<Button type="submit" variant="primary">
							{t("header.markdown")}
						</Button>
					</Form>
				</div>

				<div>
					<header className="gap-4 md:flex md:items-start md:justify-between">
						<h1>
							<small className="block text-xl text-blue-500">
								{t("header.eyebrown")}
							</small>
							{post.tutorial.title}
						</h1>
					</header>

					<MarkdownView content={post.tutorial?.content} />
				</div>
			</div>

			<Support />

			<Suspense fallback={null}>
				<Await resolve={post.recommendations} errorElement={null}>
					<footer>
						<Recommendations />
					</footer>
				</Await>
			</Suspense>
		</article>
	);
}

function Tags({ tags }: { tags: string[] }) {
	let { t } = useTranslation("translation", { keyPrefix: "tutorial" });

	if (tags.length === 0) return null;

	return (
		<TagGroup label={t("tags")} color="blue" className="not-prose flex-row">
			{tags.map((tag) => {
				let searchParams = new URLSearchParams();
				searchParams.set("q", `tech:${tag}`);

				let to = `/?${searchParams.toString()}`;

				return (
					<Tag key={tag}>
						<RemixLink to={to}>{tag}</RemixLink>
					</Tag>
				);
			})}
		</TagGroup>
	);
}

function Recommendations() {
	let recommendations = useAsyncValue() as RecommendationsList;
	let { t } = useTranslation("translation", { keyPrefix: "tutorial.related" });

	if (!recommendations || recommendations.length === 0) return null;

	return (
		<section className="not-prose mt-4 space-y-4">
			<header className="border-b border-zinc-200 pb-5">
				<h2 className="text-lg font-medium leading-6 text-zinc-900 dark:text-zinc-100">
					{t("title")}
				</h2>
			</header>

			<div
				className={cn("grid grid-cols-1 gap-4", {
					"md:grid-cols-1": recommendations.length === 1,
					"md:grid-cols-2": recommendations.length === 2,
					"md:grid-cols-3": recommendations.length >= 3,
				})}
			>
				{recommendations.map(({ title, slug, matchedTag }) => {
					let searchParams = new URLSearchParams();
					searchParams.set("q", `tech:${matchedTag}`);

					let to = `${href("/tutorials")}?${searchParams.toString()}`;

					return (
						<div key={slug} className="flex flex-col gap-2">
							<Link
								href={href("/:postType/*", {
									postType: "tutorials",
									"*": slug,
								})}
								className="line-clamp-2 block"
							>
								<p className="text-xl font-semibold">{title}</p>
							</Link>

							<Trans
								t={t}
								parent="p"
								className="py-0.5 text-sm font-medium"
								i18nKey="reason"
								values={{ tag: matchedTag }}
								components={{
									anchor: <Link href={to} />,
								}}
							/>
						</div>
					);
				})}
			</div>
		</section>
	);
}
