import { redirect } from "@remix-run/node";

export let loader: SDX.LoaderFunction = async () => {
  return redirect("https://github.com/sergiodxa/remix-i18next");
};
