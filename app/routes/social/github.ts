import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export let loader: LoaderFunction = async () => {
  return redirect("https://github.com/sergiodxa");
};
