import { LoaderFunction, redirect } from "@remix-run/node";

export let loader: LoaderFunction = async () => {
  return redirect("https://twitter.com/sergiodxa");
};
