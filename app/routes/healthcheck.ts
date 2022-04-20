import type { LoaderFunction } from "@remix-run/node";
import { db } from "~/services/db.server";

export let loader: LoaderFunction = async () => {
  await db.user.count();
  return new Response("OK", { status: 200 });
};
