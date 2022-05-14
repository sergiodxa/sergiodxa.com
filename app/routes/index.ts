import { json } from "@remix-run/node";
import { type User, userModel } from "~/models/user.server";
import { auth } from "~/services/auth.server";

export let loader: SDX.LoaderFunction = async ({ request, context }) => {
  let userId = await auth.isAuthenticated(request);
  if (!userId) return json(null);

  try {
    let user = userModel.parse(
      await context.db.user.findUnique({ where: { id: userId } })
    );
    return json<User>(user);
  } catch {
    return json(null);
  }
};
