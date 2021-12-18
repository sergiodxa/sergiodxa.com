import { BookmarkIcon, DocumentTextIcon } from "@heroicons/react/solid";
import { ContentType, Visibility } from "@prisma/client";
import { Trans, useTranslation } from "react-i18next";
import { json, Link, LoaderFunction, useLoaderData } from "remix";
import { FeedList } from "~/components/feed-list";
import { Heading, Region } from "~/components/heading";
import { db } from "~/services/db.server";
import { i18n } from "~/services/i18n.server";
import { render, TextRenderer } from "~/services/md.server";

type Item = {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  url: string;
  date: { dateTime: string; text: string };
};

type LoaderData = {
  items: Item[];
};

export let loader: LoaderFunction = async ({ request }) => {
  let locale = await i18n.getLocale(request);

  let contents = await db.content.findMany({
    where: { visibility: Visibility.PUBLIC },
    select: {
      id: true,
      type: true,
      title: true,
      headline: true,
      canonicalUrl: true,
      slug: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  let renderer = new TextRenderer();

  let items: Item[] = contents.map((content) => {
    return {
      id: content.id,
      type: content.type,
      title: content.title,
      description: render(content.headline ?? "", { renderer }),
      url:
        content.type === "ARTICLE"
          ? `/articles/${content.slug}`
          : content.canonicalUrl ?? "",
      date: {
        dateTime: content.createdAt.toISOString(),
        text: content.createdAt.toLocaleString(locale, {
          month: "short",
          year: "numeric",
          day: "2-digit",
        }),
      },
    } as Item;
  });

  return json<LoaderData>({ items });
};

export let handle = { title: "Home" };

export default function Screen() {
  let { items } = useLoaderData<LoaderData>();

  return (
    <FeedList<Item>
      className="h-full overflow-y-auto px-2 py-4 w-full max-w-screen-sm flex flex-col gap-y-8"
      aria-labelledby="main-title"
      data={items}
      keyExtractor={(item) => item.id}
      articleProps={{ className: "relative" }}
      renderItem={(item, index) => {
        let isLast = index !== items.length - 1;
        return (
          <>
            {isLast && (
              <span
                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                aria-hidden="true"
              />
            )}

            {item.type === "BOOKMARK" && <BookmarkItem item={item} />}
            {item.type === "ARTICLE" && <ArticleItem item={item} />}
          </>
        );
      }}
    />
  );
}

function ArticleItem({ item }: { item: Item }) {
  let { t } = useTranslation();
  return (
    <Region className="relative flex space-x-3 items-start">
      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-black">
        <DocumentTextIcon className="h-5 w-5 text-white" aria-hidden="true" />
      </div>

      <div className="flex-1 flex justify-between space-x-4">
        <div className="text-sm text-gray-500">
          <Trans
            t={t}
            defaults="I published <h><a>{{title}}</a></h>"
            components={{
              h: <Heading className="font-semibold inline" />,
              a: <Link to={item.url} />,
            }}
            values={{ title: item.title }}
          />
        </div>

        <time
          dateTime={item.date.dateTime}
          className="text-right text-sm whitespace-nowrap text-gray-500"
        >
          {item.date.text}
        </time>
      </div>
    </Region>
  );
}

function BookmarkItem({ item }: { item: Item }) {
  let { t } = useTranslation();
  return (
    <Region className="relative flex space-x-3 items-start">
      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-black">
        <BookmarkIcon className="h-5 w-5 text-white" aria-hidden="true" />
      </div>

      <div className="flex-1 flex justify-between space-x-4">
        <div className="text-sm text-gray-500">
          <Trans
            t={t}
            defaults="I read <h><a>{{title}}</a></h>"
            shouldUnescape={true}
            components={{
              h: <Heading className="font-semibold inline" />,
              a: <a href={item.url} />,
            }}
            values={{ title: item.title }}
          />
        </div>

        <time
          dateTime={item.date.dateTime}
          className="text-right text-sm whitespace-nowrap text-gray-500"
        >
          {item.date.text}
        </time>
      </div>
    </Region>
  );
}
