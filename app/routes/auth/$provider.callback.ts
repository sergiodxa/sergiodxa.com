import type { LoaderFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import { authenticator } from "~/services/auth.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.provider, "provider is required");
  return authenticator.authenticate(params.provider, request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};
