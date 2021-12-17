import { Content, ContentType, Role, Visibility } from "@prisma/client";
import { useId } from "@react-aria/utils";
import { useTranslation } from "react-i18next";
import { LoaderFunction, MetaFunction, Outlet, useLoaderData } from "remix";
import { json } from "remix-utils";
import { FeedList } from "~/components/feed-list";
import { authenticator } from "~/services/auth.server";
import { db } from "~/services/db.server";
import { i18n } from "~/services/i18n.server";
import { render, TextRenderer } from "~/services/md.server";

type LoaderData = {
  contents: Content[];
  locale: string;
};

export let meta: MetaFunction = () => {
  return { title: "Articles of Sergio Xalambrí" };
};

export let loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);

  let role = user ? user.role : "anonymous";

  let url = new URL(request.url);
  let term = url.searchParams.get("term") || "";

  let contents = await db.content.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      headline: true,
      canonicalUrl: true,
      updatedAt: true,
    },
    where: {
      type: ContentType.BOOKMARK,
      title: { contains: term, mode: "insensitive" },
      visibility:
        role !== Role.ADMIN ? { equals: Visibility.PUBLIC } : undefined,
    },
    orderBy: { updatedAt: "desc" },
  });

  let renderer = new TextRenderer();

  contents.forEach((post) => {
    post.headline = render(post.headline ?? "", { renderer });
  });

  let locale = await i18n.getLocale(request);

  return json<LoaderData>({ contents, locale });
};

export let handle = { title: "Bookmarks" };

export default function Screen() {
  let { t } = useTranslation();
  let id = useId();
  let { contents } = useLoaderData<LoaderData>();

  return (
    <>
      <FeedList<Content>
        className="flex flex-col flex-shrink-0 gap-y-6 w-full max-w-sm max-h-full overflow-y-auto py-4 px-2"
        aria-labelledby="main-title"
        data={contents}
        keyExtractor={(content) => content.id}
        renderItem={(content) => {
          return <ListItem content={content} />;
        }}
      />
      <Outlet />
    </>
  );
}

function ListItem({ content }: { content: Content }) {
  let { locale } = useLoaderData<LoaderData>();

  let updatedAt = new Date(content.updatedAt);

  return (
    <a
      href={content.canonicalUrl ?? "/"}
      className="flex flex-col gap-y-1.5 text-sm py-2 px-4 hover:bg-gray-200 rounded-md"
    >
      <h2 className="font-medium text-black">{content.title}</h2>
      <p
        className="text-gray-500 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: content.headline ?? "" }}
      />
      <time dateTime={updatedAt.toJSON()} className="text-gray-400 text-xs">
        {updatedAt.toLocaleDateString(locale, {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </time>
    </a>
  );
}
