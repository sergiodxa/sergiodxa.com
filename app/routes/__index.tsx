import {
  BookmarkIcon,
  DocumentTextIcon,
  ExternalLinkIcon,
  HomeIcon,
  LockClosedIcon,
  PuzzleIcon,
  TranslateIcon,
} from "@heroicons/react/solid";
import clsx from "clsx";
import { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "remix";
import { Heading, Region } from "~/components/heading";
import { GitHubIcon, TwitterIcon } from "~/components/icons";

type Link = {
  to: string;
  label: string;
  icon?(props: ComponentProps<"svg">): JSX.Element;
  external?: boolean;
};

export default function Screen() {
  let { t } = useTranslation();

  let primary: Link[] = [
    { to: "/", label: t("Home"), icon: HomeIcon },
    { to: "articles", label: t("Articles"), icon: DocumentTextIcon },
  ];

  let me: Link[] = [
    { to: "bookmarks", label: t("Bookmarks"), icon: BookmarkIcon },
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
      <header className="flex-shrink-0 flex flex-col w-full max-w-xs px-2 py-4 gap-y-6">
        <p className="font-extrabold text-xl px-2">Sergio Xalambrí</p>

        <nav className="contents">
          <Navigation links={primary} title={t("Primary")} hideTitle />
          <Navigation links={me} title={t("Me")} />
          <Navigation links={projects} title={t("Projects")} />
          <Navigation links={online} title={t("Online")} />
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

function LinkItem({ link }: { link: Link }) {
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
      {link.icon && <link.icon className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-grow">{link.label}</span>
      {link.external && <ExternalLinkIcon className="w-4 h-4 flex-shrink-0" />}
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
