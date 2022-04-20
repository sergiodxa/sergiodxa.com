import { LoaderFunction } from "@remix-run/node";
import { db } from "~/services/db.server";

export let loader: LoaderFunction = async () => {
  await db.content.count();
  return new Response("OK", { status: 200 });
};
