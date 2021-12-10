import { LoaderFunction, redirect } from "remix";
import { main } from "~/scripts/migrate-cn-to-db";
import { adminAuthorizer } from "~/services/auth.server";

export let loader: LoaderFunction = async (args) => {
  let user = await adminAuthorizer.authorize(args, {
    failureRedirect: "/",
    raise: "redirect",
  });
  await main(user);
  return redirect("/articles");
};
