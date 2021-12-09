import { LogoutIcon } from "@heroicons/react/outline";
import {
  BookmarkIcon,
  CodeIcon,
  DocumentTextIcon,
  ExternalLinkIcon,
  HomeIcon,
  LockClosedIcon,
  PuzzleIcon,
  TranslateIcon,
} from "@heroicons/react/solid";
import type { User } from "@prisma/client";
import clsx from "clsx";
import { ComponentProps } from "react";
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
import { Heading, Region } from "~/components/heading";
import { GitHubIcon, TwitterIcon } from "~/components/icons";
import { authenticator } from "~/services/auth.server";
import { pick } from "~/utils/objects";

type LoaderData = {
  user: Pick<User, "avatar" | "displayName"> | null;
};

type Link = {
  to: string;
  label: string;
  icon?(props: ComponentProps<"svg">): JSX.Element;
  external?: boolean;
};

export let loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);
  return json({ user: user ? pick(user, ["avatar", "displayName"]) : null });
};

export default function Screen() {
  let { t } = useTranslation();
  let { user } = useLoaderData<LoaderData>();

  let primary: Link[] = [
    { to: "/", label: t("Home"), icon: HomeIcon },
    { to: "articles", label: t("Articles"), icon: DocumentTextIcon },
  ];

  let me: Link[] = [
    { to: "bookmarks", label: t("Bookmarks"), icon: BookmarkIcon },
    { to: "oss", label: t("Open Source"), icon: CodeIcon },
  ];

  let projects: Link[] = [
    {
      to: "projects/remix-auth",
      label: t("Remix Auth"),
      icon: LockClosedIcon,
      external: true,
    },
    {
      to: "projects/remix-i18next",
      label: t("Remix i18next"),
      icon: TranslateIcon,
      external: true,
    },
    {
      to: "projects/remix-utils",
      label: t("Remix Utils"),
      icon: PuzzleIcon,
      external: true,
    },
  ];

  let online: Link[] = [
    {
      to: "social/twitter",
      label: t("Twitter"),
      icon: TwitterIcon,
      external: true,
    },
    {
      to: "social/github",
      label: t("GitHub"),
      icon: GitHubIcon,
      external: true,
    },
  ];

  return (
    <div className="flex h-full divide-x divide-gray-100">
      <header className="flex-shrink-0 flex flex-col w-full max-w-xs px-2 pt-4 gap-y-6 max-h-full overflow-y-auto">
        <p className="font-extrabold text-xl px-2">Sergio Xalambrí</p>

        <nav className="contents">
          <Navigation links={primary} title={t("Primary")} hideTitle />
          <Navigation links={me} title={t("Me")} />
          <Navigation links={projects} title={t("Projects")} />
          <Navigation links={online} title={t("Online")} />
        </nav>

        {user !== null ? (
          <div className="mt-auto flex items-center gap-x-1 px-2 py-3 border-t border-gray-100 -mx-2">
            <img
              src={user.avatar}
              className="rounded-full h-6 w-6 border border-gray-100 flex-shrink-0"
            />
            <p className="text-sm">@{user.displayName}</p>
            <Form
              action="/auth/logout"
              method="post"
              reloadDocument
              className="ml-auto"
            >
              <button type="submit">
                <span className="sr-only">{t("Logout")}</span>
                <LogoutIcon aria-hidden className="w-4 h-4" />
              </button>
            </Form>
          </div>
        ) : (
          <div className="mt-auto border-t border-gray-100 -mx-2 px-2 py-2">
            <Link
              to="login"
              className="block text-sm text-center w-full py-1 rounded-md hover:bg-gray-100"
            >
              <span>{t("Sign In")}</span>
            </Link>
          </div>
        )}
      </header>
      <Outlet />
    </div>
  );
}

function LinkItem({ link }: { link: Link }) {
  let { t } = useTranslation();
  return (
    <NavLink
      to={link.to}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-x-1",
          "px-2 py-1.5 rounded-md",
          "text-sm font-medium",
          "focus:outline-none focus:bg-gray-100 focus:text-gray-900",
          {
            "bg-black text-white": isActive,
            "text-gray-700 hover:text-gray-900 hover:bg-gray-100": !isActive,
          }
        )
      }
    >
      {link.icon && <link.icon aria-hidden className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-grow">{link.label}</span>
      {link.external && (
        <>
          <span className="sr-only">{t("External")}</span>
          <ExternalLinkIcon aria-hidden className="w-4 h-4 flex-shrink-0" />
        </>
      )}
    </NavLink>
  );
}

type NavigationProps = {
  links: Link[];
  title: string;
  hideTitle?: boolean;
};

function Navigation({ links, title, hideTitle = false }: NavigationProps) {
  return (
    <Region className="space-y-2">
      <Heading
        className={clsx("text-xs text-gray-500 font-medium px-2", {
          "sr-only": hideTitle,
        })}
      >
        {title}
      </Heading>

      <ul className="flex flex-col gap-y-1.5">
        {links.map((link) => {
          return (
            <li key={link.to}>
              <LinkItem link={link} />
            </li>
          );
        })}
      </ul>
    </Region>
  );
}
