import { StarIcon } from "@heroicons/react/outline";
import { useId } from "@react-aria/utils";
import { Trans, useTranslation } from "react-i18next";
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
import { getRepos, Repository } from "~/services/gh.server";
import { i18n } from "~/services/i18n.server";
import { pick } from "~/utils/objects";

type MinimalRepo = Pick<
  Repository,
  | "name"
  | "stargazers_count"
  | "description"
  | "id"
  | "updated_at"
  | "full_name"
>;

type LoaderData = {
  repos: MinimalRepo[];
  locale: string;
};

export let meta: MetaFunction = () => {
  return { title: "Repos of Sergio Xalambrí" };
};

export let loader: LoaderFunction = async ({ request }) => {
  let url = new URL(request.url);

  let page = Number(url.searchParams.get("page") || "1");

  let repos = await getRepos(page);

  let locale = await i18n.getLocale(request);

  return json({
    repos: pick(repos, [
      "id",
      "name",
      "stargazers_count",
      "description",
      "updated_at",
      "full_name",
    ]),
    locale,
  });
};

export default function Screen() {
  let { t } = useTranslation();
  let id = useId();
  let { repos } = useLoaderData<LoaderData>();

  return (
    <>
      <FeedList<MinimalRepo>
        className="flex flex-col flex-shrink-0 gap-y-2 w-full max-w-sm max-h-full overflow-y-auto py-4 px-2"
        heading={
          <header className="px-4 pb-4">
            <Heading level={2} id={id} className="font-medium">
              {t("Open Source")}
            </Heading>
          </header>
        }
        aria-labelledby={id}
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

function Item({ repo }: { repo: MinimalRepo }) {
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
