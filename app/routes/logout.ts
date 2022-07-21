import type { ActionArgs } from "@remix-run/node";
import { auth } from "~/services/auth.server";

export async function action({ request }: ActionArgs) {
  return await auth.logout(request, {
    redirectTo: "/",
  });
}
