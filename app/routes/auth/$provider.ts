import type { ActionFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import { authenticator } from "~/services/auth.server";

export let action: ActionFunction = async ({ request, params }) => {
  invariant(params.provider, "provider is required");
  return await authenticator.authenticate(params.provider, request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};
