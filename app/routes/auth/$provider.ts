import type { ActionFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import { auth, returnToCookie } from "~/services/auth.server";

export let action: ActionFunction = async ({ request, params }) => {
  invariant(params.provider, "provider is required");
  let returnTo = await returnToCookie.parse(request.headers.get("Cookie"));
  return await auth.authenticate(params.provider, request, {
    successRedirect: returnTo ?? "/",
    failureRedirect: "/login",
  });
};
