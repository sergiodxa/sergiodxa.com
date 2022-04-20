import type { User } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { auth } from "~/services/auth.server";
import { db } from "~/services/db.server";

export let loader: LoaderFunction = async ({ request }) => {
  let userId = await auth.isAuthenticated(request);
  if (!userId) return json(null);
  let user = await db.user.findFirst({ where: { id: userId } });
  if (!user) return json(null);
  return json<User>(user);
};
