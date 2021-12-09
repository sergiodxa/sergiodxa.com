import { LoaderFunction } from "@remix-run/server-runtime";

export let loader: LoaderFunction = async () => {
  return new Response("OK", { status: 200 });
};
