import { Content, ContentType, Role, Visibility } from "@prisma/client";
import {
  json,
  LoaderFunction,
  MetaFunction,
  NavLink,
  Outlet,
  useLoaderData,
} from "remix";
import { FeedList } from "~/components/feed-list";
import { authenticator } from "~/services/auth.server";
import { db } from "~/services/db.server";
import { i18n } from "~/services/i18n.server";
import { PlainTextRenderer, render } from "~/services/md.server";

type Article = Pick<
  Content,
  "id" | "title" | "slug" | "headline" | "updatedAt"
>;

type LoaderData = {
  articles: Article[];
  locale: string;
};

export let meta: MetaFunction = () => {
  return { title: "Articles of Sergio Xalambrí" };
};

export let loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);

  let role = user ? user.role : "anonymous";

  let url = new URL(request.url);
  let page = Number(url.searchParams.get("page") || "1");
  let term = url.searchParams.get("term") || "";

  let articles = await db.content.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      headline: true,
      updatedAt: true,
    },
    where: {
      type: ContentType.ARTICLE,
      author: { email: "hello@sergiodxa.com" },
      body: { contains: term, mode: "insensitive" },
      headline: { contains: term, mode: "insensitive" },
      visibility:
        role !== Role.ADMIN ? { equals: Visibility.PUBLIC } : undefined,
    },
    skip: (page - 1) * 10,
    take: await db.content.count(),
    orderBy: { updatedAt: "desc" },
  });

  let renderer = new PlainTextRenderer();

  articles.forEach((post) => {
    post.headline = render(post.headline ?? "", { renderer });
  });

  let locale = await i18n.getLocale(request);

  return json<LoaderData>({ articles, locale });
};

export let handle = { title: "Articles" };

export default function Screen() {
  let { articles } = useLoaderData<LoaderData>();

  return (
    <>
      <FeedList<Article>
        className="flex flex-col flex-shrink-0 gap-y-6 w-full max-w-sm max-h-full overflow-y-auto py-4 px-2"
        aria-labelledby="main-title"
        data={articles}
        keyExtractor={(article) => article.id}
        renderItem={(article) => {
          return <ListItem article={article} />;
        }}
      />
      <Outlet />
    </>
  );
}

function ListItem({ article }: { article: Article }) {
  let { locale } = useLoaderData<LoaderData>();

  let updatedAt = new Date(article.updatedAt);

  return (
    <NavLink
      to={article.slug}
      className="flex flex-col gap-y-1.5 text-sm py-2 px-4 hover:bg-gray-200 rounded-md"
      prefetch="intent"
    >
      <h2 className="font-medium text-black">{article.title}</h2>
      <p
        className="text-gray-500 line-clamp-3"
        dangerouslySetInnerHTML={{ __html: article.headline ?? "" }}
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
