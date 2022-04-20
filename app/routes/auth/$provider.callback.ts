import type { LoaderFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import { auth, returnToCookie } from "~/services/auth.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.provider, "provider is required");
  let returnTo = await returnToCookie.parse(request.headers.get("Cookie"));
  return auth.authenticate(params.provider, request, {
    successRedirect: returnTo ?? "/",
    failureRedirect: "/login",
  });
};
