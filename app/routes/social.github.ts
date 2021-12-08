import { LoaderFunction, redirect } from "remix";

export let loader: LoaderFunction = async () => {
  return redirect("https://github.com/sergiodxa");
};
