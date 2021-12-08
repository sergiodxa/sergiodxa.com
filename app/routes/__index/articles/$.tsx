import { HTML, Note } from "collected-notes";
import { json, LinksFunction, LoaderFunction, useLoaderData } from "remix";
import invariant from "tiny-invariant";
import { cn, site } from "~/services/cn.server";
import highlightStyles from "~/styles/highlight.css";

type LoaderData = {
  body: HTML;
  note: Note;
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: highlightStyles }];
};

export let loader: LoaderFunction = async ({ params }) => {
  let slug = params["*"];
  invariant(slug, "Article slug is required");
  let { body, note } = await cn.body(site, slug);
  return json({ body, note });
};

export default function Screen() {
  let { body } = useLoaderData<LoaderData>();
  return (
    <div className="h-full overflow-y-auto w-full">
      <article
        className="prose mx-auto my-8"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}
