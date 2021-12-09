import { useId } from "@react-aria/utils";
import { Note } from "collected-notes";
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
import { cn, site } from "~/services/cn.server";
import { i18n } from "~/services/i18n.server";

type LoaderData = {
  notes: Note[];
  locale: string;
};

export let meta: MetaFunction = () => {
  return { title: "Articles of Sergio Xalambrí" };
};

export let loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let page = Number(url.searchParams.get("page") || "1");
  let term = url.searchParams.get("term") || "";

  let notes = term
    ? await cn.search(site, term, page, "public_site")
    : await cn.latestNotes(site, page, "public_site");

  let locale = await i18n.getLocale(request);

  return json({ notes, locale });
};

export default function Screen() {
  let { t } = useTranslation();
  let id = useId();
  let { notes } = useLoaderData<LoaderData>();

  return (
    <>
      <FeedList<Note>
        className="flex flex-col flex-shrink-0 gap-y-6 w-full max-w-sm max-h-full overflow-y-auto py-4 px-2"
        heading={
          <header className="px-4">
            <Heading level={2} id={id} className="font-medium">
              {t("Articles")}
            </Heading>
          </header>
        }
        aria-labelledby={id}
        data={notes}
        keyExtractor={(note) => note.id}
        renderItem={(note) => {
          return <NoteItem note={note} />;
        }}
      />
      <Outlet />
    </>
  );
}

function NoteItem({ note }: { note: Note }) {
  let { locale } = useLoaderData<LoaderData>();

  let updatedAt = new Date(note.updated_at);

  return (
    <NavLink
      to={note.path}
      className="flex flex-col gap-y-1.5 text-sm py-2 px-4 hover:bg-gray-200 rounded-md"
    >
      <h2 className="font-medium text-black">{note.title}</h2>
      <p className="text-gray-500">{note.headline}</p>
      <time dateTime={note.updated_at} className="text-gray-400 text-xs">
        {updatedAt.toLocaleDateString(locale, {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </time>
    </NavLink>
  );
}
