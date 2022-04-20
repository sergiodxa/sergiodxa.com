// app/routes/magic.tsx
import { LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export let loader: LoaderFunction = async ({ request }) => {
  await authenticator.authenticate("email-link", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};
