import { ActionFunction, redirect } from "remix";
import { destroySession, getSession } from "~/services/session.server";

export let action: ActionFunction = async ({ request }) => {
  let session = await getSession(request);
  let headers = new Headers({ "Set-Cookie": await destroySession(session) });
  return redirect("/", { headers });
};
