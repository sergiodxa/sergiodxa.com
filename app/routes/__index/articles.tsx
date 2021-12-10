import { Post } from "@prisma/client";
import { useId } from "@react-aria/utils";
import { useTranslation } from "react-i18next";
import {
  json,
  LoaderFunction,
  MetaFunction,
  NavLink,
  Outlet,
  useLoaderData,
} from "remix";
import { FeedList } from "~/components/feed-list";
import { Heading } from "~/components/heading";
import { db } from "~/services/db.server";
import { i18n } from "~/services/i18n.server";

type LoaderData = {
  posts: Post[];
  locale: string;
};

export let meta: MetaFunction = () => {
  return { title: "Articles of Sergio Xalambrí" };
};

export let loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let page = Number(url.searchParams.get("page") || "1");
  let term = url.searchParams.get("term") || "";

  let posts = await db.post.findMany({
    select: { title: true, slug: true, headline: true, updatedAt: true },
    where: {
      author: { email: "hello@sergiodxa.com" },
      body: { contains: term, mode: "insensitive" },
      headline: { contains: term, mode: "insensitive" },
    },
    skip: (page - 1) * 10,
    take: await db.post.count(),
    orderBy: { updatedAt: "desc" },
  });

  let locale = await i18n.getLocale(request);

  return json({ posts, locale });
};

export default function Screen() {
  let { t } = useTranslation();
  let id = useId();
  let { posts } = useLoaderData<LoaderData>();

  return (
    <>
      <FeedList<Post>
        className="flex flex-col flex-shrink-0 gap-y-6 w-full max-w-sm max-h-full overflow-y-auto py-4 px-2"
        heading={
          <header className="px-4">
            <Heading level={2} id={id} className="font-medium">
              {t("Articles")}
            </Heading>
          </header>
        }
        aria-labelledby={id}
        data={posts}
        keyExtractor={(note) => note.id}
        renderItem={(note) => {
          return <NoteItem post={note} />;
        }}
      />
      <Outlet />
    </>
  );
}

function NoteItem({ post }: { post: Post }) {
  let { locale } = useLoaderData<LoaderData>();

  let updatedAt = new Date(post.updatedAt);

  return (
    <NavLink
      to={post.slug}
      className="flex flex-col gap-y-1.5 text-sm py-2 px-4 hover:bg-gray-200 rounded-md"
      prefetch="intent"
    >
      <h2 className="font-medium text-black">{post.title}</h2>
      <p className="text-gray-500 line-clamp-3">{post.headline}</p>
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
