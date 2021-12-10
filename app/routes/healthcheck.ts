import { LoaderFunction } from "remix";

export let loader: LoaderFunction = async () => {
  return new Response("OK", { status: 200 });
};
