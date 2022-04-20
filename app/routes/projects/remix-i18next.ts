import { LoaderFunction, redirect } from "@remix-run/node";

export let loader: LoaderFunction = async () => {
  return redirect("https://github.com/sergiodxa/remix-i18next");
};
