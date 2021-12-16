import { BookmarkIcon, DocumentTextIcon } from "@heroicons/react/solid";
import { ContentType, Visibility } from "@prisma/client";
import { useId } from "@react-aria/utils";
import { useTranslation } from "react-i18next";
import { Link, LoaderFunction, useLoaderData } from "remix";
import { json } from "remix-utils";
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

function getContentIcon(type: ContentType) {
  switch (type) {
    case ContentType.ARTICLE:
      return DocumentTextIcon;
    case ContentType.BOOKMARK:
      return BookmarkIcon;
    default:
      throw new Error(`Invalid content type "${type}"`);
  }
}

export default function Screen() {
  let { items } = useLoaderData<LoaderData>();
  let { t } = useTranslation();
  let id = useId();
  return (
    <div className="h-full overflow-y-auto p-8 w-full max-w-screen-sm">
      <FeedList<Item>
        heading={
          <header className="px-4 mb-8">
            <Heading level={2} id={id} className="font-medium">
              {t("Timeline")}
            </Heading>
          </header>
        }
        aria-labelledby={id}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={(item, index) => {
          let Icon = getContentIcon(item.type);

          return (
            <div className="relative pb-8">
              {index !== items.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <Region className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-black">
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div className="text-sm text-gray-500">
                    <Heading className="font-semibold">
                      {item.type === "BOOKMARK" ? (
                        <a href={item.url}>{item.title}</a>
                      ) : (
                        <Link to={item.url}>{item.title}</Link>
                      )}
                    </Heading>
                    <p
                      className="line-clamp-1"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={item.date.dateTime}>{item.date.text}</time>
                  </div>
                </div>
              </Region>
            </div>
          );
        }}
      />
    </div>
  );
}
