/* This example requires Tailwind CSS v2.0+ */

import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";

export function Header() {
  let { t } = useTranslation();

  let navigation: Array<{ name: string; href: string }> = [
    { name: t("Solutions"), href: "#" },
    { name: t("Pricing"), href: "#" },
    { name: t("Docs"), href: "#" },
    { name: t("Company"), href: "#" },
  ];

  return (
    <header className="bg-indigo-600">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div className="flex items-center">
            <a href="#">
              <span className="sr-only">Sergio Xalambrí</span>
              <img
                className="h-10 w-auto"
                src="https://github.com/sergiodxa.png"
                alt=""
              />
            </a>
            <div className="hidden ml-10 space-x-8 lg:block">
              {navigation.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-base font-medium text-white hover:text-indigo-50"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="ml-10 space-x-4">
            <Link
              to="/login"
              className="inline-block bg-white py-2 px-4 border border-transparent rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Sign up
            </Link>
          </div>
        </div>
        <div className="py-4 flex flex-wrap justify-center space-x-6 lg:hidden">
          {navigation.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-base font-medium text-white hover:text-indigo-50"
            >
              {link.name}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
