import { json, LoaderFunction, MetaFunction, useLoaderData } from "remix";
import invariant from "tiny-invariant";
import { FullRepository, getRepo, getRepoReadme } from "~/services/gh.server";
import { GitHubRenderer, render } from "~/services/md.server";
import { pick } from "~/utils/objects";

type LoaderData = {
  repo: Pick<FullRepository, "full_name">;
  body: string;
};

export let meta: MetaFunction = ({ data }) => {
  let { repo } = data as LoaderData;
  return { title: repo.full_name };
};

export let loader: LoaderFunction = async ({ params }) => {
  let slug = params.repo;
  invariant(slug, "Repository is required");
  let [repo, readme] = await Promise.all([getRepo(slug), getRepoReadme(slug)]);
  let markdown = Buffer.from(readme.content, "base64").toString("utf-8");
  return json({
    repo: pick(repo, ["full_name"]),
    body: render(markdown, {
      renderer: new GitHubRenderer(slug),
    }),
  });
};

export default function Screen() {
  let { body } = useLoaderData<LoaderData>();
  return (
    <main className="h-full overflow-y-auto w-full">
      <article className="prose prose-lg mx-auto my-8">
        <div className="contents" dangerouslySetInnerHTML={{ __html: body }} />
      </article>
    </main>
  );
}
