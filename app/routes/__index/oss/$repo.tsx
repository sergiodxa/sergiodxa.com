import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Repositories } from "~/features/repositories.server";

type LoaderData = {
  title: string;
  body: string;
};

export let meta: MetaFunction = ({ data }) => {
  let { title } = data as LoaderData;
  return { title };
};

export let loader: LoaderFunction = async ({ params }) => {
  let slug = params.repo;
  invariant(slug, "Repository is required");
  return json<LoaderData>(await Repositories.getSingle(slug));
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
