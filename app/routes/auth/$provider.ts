import { ActionFunction } from "remix";
import { authenticator } from "~/services/auth.server";

export let action: ActionFunction = async ({ request }) => {
  return authenticator.authenticate("github", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};
