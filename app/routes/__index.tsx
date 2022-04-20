import { ExternalLinkIcon, HomeIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet } from "@remix-run/react";
import { Heading, Region } from "~/components/heading";
import { authenticator } from "~/services/auth.server";

type Link = {
  to: string;
  label: string;
  icon?(props: ComponentProps<"svg">): JSX.Element;
  external?: boolean;
};

export let loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);
  return json({ user });
};

export let handle = { hydrate: true };

export default function Screen() {
  let { t } = useTranslation();

  let primary: Link[] = [{ to: "/feed", label: t("The Feed"), icon: HomeIcon }];

  // let me: Link[] = [
  //   { to: "articles", label: t("Articles"), icon: DocumentTextIcon },
  //   { to: "bookmarks", label: t("Bookmarks"), icon: BookmarkIcon },
  //   { to: "oss", label: t("Open Source"), icon: CodeIcon },
  // ];

  // let projects: Link[] = [
  //   {
  //     to: "projects/remix-auth",
  //     label: t("Remix Auth"),
  //     icon: LockClosedIcon,
  //     external: true,
  //   },
  //   {
  //     to: "projects/remix-i18next",
  //     label: t("Remix i18next"),
  //     icon: TranslateIcon,
  //     external: true,
  //   },
  //   {
  //     to: "projects/remix-utils",
  //     label: t("Remix Utils"),
  //     icon: PuzzleIcon,
  //     external: true,
  //   },
  // ];

  // let online: Link[] = [
  //   {
  //     to: "social/twitter",
  //     label: t("Twitter"),
  //     icon: TwitterIcon,
  //     external: true,
  //   },
  //   {
  //     to: "social/github",
  //     label: t("GitHub"),
  //     icon: GitHubIcon,
  //     external: true,
  //   },
  // ];

  return (
    <div className="flex flex-col relative">
      {/* <Menu
        primary={primary}
        me={me}
        projects={projects}
        online={online}
        user={user}
      /> */}

      <div>
        <header className="px-4 flex items-center gap-x-4">
          <Navigation links={primary} title={t("Primary")} hideTitle />
          {/* <div className="ml-auto">
            <UserStatus user={user} />
          </div> */}
          {/* <nav className="flex items-end gap-x-4">
            <Navigation links={me} title={t("Me")} />
            <Navigation links={projects} title={t("Projects")} />
            <Navigation links={online} title={t("Online")} />
          </nav> */}
        </header>

        <Outlet />
      </div>
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
    <Region>
      <Heading
        className={clsx("text-xs text-gray-500 font-medium px-2", {
          "sr-only": hideTitle,
        })}
      >
        {title}
      </Heading>

      <ul className="flex gap-x-1.5">
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
