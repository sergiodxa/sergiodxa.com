import { StarIcon } from "@heroicons/react/outline";
import { Trans } from "react-i18next";
import {
  json,
  LoaderFunction,
  MetaFunction,
  NavLink,
  Outlet,
  useLoaderData,
} from "remix";
import { FeedList } from "~/components/feed-list";
import {
  ListOfRepositories,
  Repositories,
} from "~/features/repositories.server";
import { i18n } from "~/services/i18n.server";

type LoaderData = {
  repos: ListOfRepositories;
  locale: string;
};

export let meta: MetaFunction = () => {
  return { title: "Repos of Sergio Xalambrí" };
};

export let loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);

  let page = Number(url.searchParams.get("page") || "1");

  let [repos, locale] = await Promise.all([
    Repositories.getList(page),
    i18n.getLocale(request),
  ]);

  return json({ repos, locale });
};

export let handle = { title: "Open Source" };

export default function Screen() {
  let { repos } = useLoaderData<LoaderData>();

  return (
    <>
      <FeedList<ListOfRepositories[0]>
        className="flex flex-col flex-shrink-0 gap-y-2 w-full max-w-sm max-h-full overflow-y-auto py-4 px-2"
        aria-labelledby="main-title"
        data={repos}
        keyExtractor={(note) => note.id}
        renderItem={(note) => {
          return <Item repo={note} />;
        }}
      />
      <Outlet />
    </>
  );
}

function Item({ repo }: { repo: ListOfRepositories[0] }) {
  let { locale } = useLoaderData<LoaderData>();

  let updatedAt = new Date(repo.updated_at);

  return (
    <NavLink
      to={repo.name}
      className="flex flex-col gap-y-1.5 text-sm py-2 px-4 hover:bg-gray-200 rounded-md"
    >
      <header className="flex justify-between items-center">
        <h2 className="text-black text-sm">
          <Trans
            defaults="sergiodxa/<b>{{repo}}</b>"
            values={{ repo: repo.name }}
            components={{
              b: <strong className="text-base" />,
            }}
          />
        </h2>
        <div className="flex gap-x-1 items-center text-gray-500 flex-shrink-0">
          <StarIcon className="w-4 h-4" aria-hidden />
          <span>{repo.stargazers_count}</span>
        </div>
      </header>
      <p className="text-gray-500">{repo.description}</p>
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
