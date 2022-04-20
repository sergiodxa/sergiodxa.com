import { Role } from "@prisma/client";
import { useTranslation } from "react-i18next";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Region } from "~/components/heading";
import { authenticator } from "~/services/auth.server";

type LoaderData = {
  isAdmin: boolean;
};

export let loader: LoaderFunction = async ({ request }) => {
  let user = await authenticator.isAuthenticated(request);
  let isAdmin = user?.role === Role.ADMIN;
  return json<LoaderData>({ isAdmin });
};

export default function Screen() {
  let { isAdmin } = useLoaderData<LoaderData>();
  let { t } = useTranslation();

  return (
    <Region className="w-full relative">
      {isAdmin && (
        <div className="inset-0 absolute flex items-center justify-center">
          <Link to="write">{t("Write a new article")}</Link>
        </div>
      )}
    </Region>
  );
}
