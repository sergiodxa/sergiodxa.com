import { Content, ContentType, Role, Visibility } from "@prisma/client";
import { singularize } from "inflected";
import { json, LoaderFunction } from "@remix-run/node";
import { Link, NavLink, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { FeedList } from "~/components/feed-list";
import { authenticator } from "~/services/auth.server";
import { db } from "~/services/db.server";
import { i18n } from "~/services/i18n.server";
import { PlainTextRenderer, render } from "~/services/md.server";
import { pick } from "~/utils/objects";

type ListItem = Pick<
  Content,
  "id" | "title" | "slug" | "headline" | "updatedAt"
>;

type LoaderData = {
  contents: ListItem[];
  locale: string;
  nextPage: number | null;
  prevPage: number | null;
};

function isContentType(
  contentType: string
): asserts contentType is ContentType {
  let is = Object.values(ContentType).includes(contentType as ContentType);
  if (!is) throw new Error("Invalid content type");
}

export let loader: LoaderFunction = async ({ request, params }) => {
  console.log(request.headers.get("sec-fetch-dest"));
  let user = await authenticator.isAuthenticated(request);

  let role = user ? user.role : "anonymous";

  let { contentType } = params;
  contentType = singularize(contentType?.toUpperCase() ?? "");
  invariant(contentType, "contentType is required");
  isContentType(contentType);

  let url = new URL(request.url);
  let page = Number(url.searchParams.get("page") || "1");
  let term = url.searchParams.get("term") || "";

  let where = {
    type: { equals: contentType },
    // body: { contains: term, mode: "insensitive" },
    // headline: { contains: term, mode: "insensitive" },
    visibility: role !== Role.ADMIN ? { equals: Visibility.PUBLIC } : undefined,
  };

  let count = await db.content.count({ where });
  let pages = Math.ceil(count / 10);

  let contents = await db.content.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      headline: true,
      updatedAt: true,
    },
    skip: (page - 1) * 10,
    take: 10,
    orderBy: { updatedAt: "desc" },
  });

  let nextPage: number | null = page;
  if (nextPage < pages) nextPage += 1;
  else nextPage = null;

  let prevPage: number | null = page;
  if (prevPage === 1) prevPage = null;
  else prevPage -= 1;

  let renderer = new PlainTextRenderer();

  contents.forEach((content) => {
    content.headline = render(content.headline ?? "", { renderer });
  });

  let locale = await i18n.getLocale(request);

  return json<LoaderData>({
    contents: pick(contents, ["id", "title", "slug", "headline", "updatedAt"]),
    locale,
    nextPage,
    prevPage,
  });
};

export default function Screen() {
  let { contents, nextPage, prevPage } = useLoaderData<LoaderData>();

  return (
    <div className="flex flex-col flex-shrink-0 gap-y-6 w-full max-w-screen-lg mx-auto py-4 px-2">
      <FeedList<ListItem>
        className="flex flex-col gap-y-6 flex-shrink-0 w-full"
        aria-labelledby="main-title"
        data={contents}
        keyExtractor={(item) => item.id}
        renderItem={(item) => {
          return <Item item={item} />;
        }}
      />
      <div className="flex justify-evenly">
        {typeof prevPage === "number" && (
          <Link to={`?page=${prevPage}`}>Prev</Link>
        )}
        {typeof nextPage === "number" && (
          <Link to={`?page=${nextPage}`}>Next</Link>
        )}
      </div>
    </div>
  );
}

function Item({ item }: { item: ListItem }) {
  let { locale } = useLoaderData<LoaderData>();

  let updatedAt = new Date(item.updatedAt);

  return (
    <NavLink
      to={item.slug}
      className="flex flex-col gap-y-1.5 text-sm py-2 px-4 hover:bg-gray-200 rounded-md"
      prefetch="none"
    >
      <h2 className="font-medium text-black">{item.title}</h2>
      <p
        className="text-gray-500 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: item.headline ?? "" }}
      />
      <time dateTime={updatedAt.toJSON()} className="text-gray-400 text-xs">
        {updatedAt.toLocaleDateString(locale, {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </time>
    </NavLink>
  );
}
