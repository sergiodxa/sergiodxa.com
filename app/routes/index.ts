import { type User } from "@prisma/client";
import { json } from "@remix-run/node";
import { auth } from "~/services/auth.server";

export let loader: SDX.LoaderFunction = async ({ request, context }) => {
  let userId = await auth.isAuthenticated(request);
  if (!userId) return json(null);

  let user = await context.db.user.findUnique({ where: { id: userId } });
  if (!user) return json(null);
  return json<User>(user);
};
