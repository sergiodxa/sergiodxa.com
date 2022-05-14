import { redirect } from "@remix-run/node";

export let loader: SDX.LoaderFunction = async () => {
  return redirect("https://twitter.com/sergiodxa");
};
