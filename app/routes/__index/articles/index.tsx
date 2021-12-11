import { Role } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { Link, LoaderFunction, useLoaderData } from "remix";
import { json } from "remix-utils";
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
    <Region className="w-full">
      {isAdmin && <Link to="write">{t("Write a new article")}</Link>}
    </Region>
  );
}
