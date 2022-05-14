import type { ActionFunction } from "@remix-run/node";
import { auth } from "~/services/auth.server";

export let action: ActionFunction = async ({ request }) => {
  return await auth.logout(request, {
    redirectTo: "/",
  });
};
