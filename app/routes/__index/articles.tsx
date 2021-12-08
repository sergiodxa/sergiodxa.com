import { Note } from "collected-notes";
import { useTranslation } from "react-i18next";
import {
  Form,
  json,
  Link,
  LoaderFunction,
  NavLink,
  Outlet,
  useLoaderData,
} from "remix";
import { cn, site } from "~/services/cn.server";
import { i18n } from "~/services/i18n.server";

type LoaderData = {
  notes: Note[];
  locale: string;
  term: string;
  page: number;
};

export let loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);
  let page = Number(url.searchParams.get("page") || "1");
  let term = url.searchParams.get("term") || "";

  let notes = term
    ? await cn.search(site, term, page, "public_site")
    : await cn.latestNotes(site, page, "public_site");

  let locale = await i18n.getLocale(request);

  return json({ notes, locale, term, page });
};

export default function Screen() {
  let { t } = useTranslation();
  let { notes, term } = useLoaderData<LoaderData>();

  return (
    <>
      <section
        className="flex flex-col flex-shrink-0 gap-y-1.5 w-full max-w-sm max-h-full overflow-y-auto py-4 px-2"
        aria-label={t("Articles")}
      >
        <Form role="search">
          <div>
            <label htmlFor="term" className="sr-only">
              {t("Search")}
            </label>
            <input
              type="search"
              name="term"
              id="term"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder={t("Remix, React, Next...")}
              defaultValue={term}
            />
          </div>
        </Form>

        <section>
          {notes.map((note) => {
            return (
              <article>
                <NoteItem note={note} key={note.id} />
              </article>
            );
          })}
        </section>

        <Pagination />
      </section>
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

function Pagination() {
  let { t } = useTranslation();
  let { page } = useLoaderData<LoaderData>();
  return (
    <nav
      className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      aria-label={"Pagination"}
    >
      <div className="flex-1 flex justify-between sm:justify-end">
        <Link
          to={`?page=${page - 1 > 0 ? page - 1 : 1}`}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full justify-center"
        >
          {t("Previous")}
        </Link>
        <Link
          to={`?page=${page + 1}`}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full justify-center"
        >
          {t("Next")}
        </Link>
      </div>
    </nav>
  );
}
