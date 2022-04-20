import { LoaderFunction, redirect } from "@remix-run/node";

export let loader: LoaderFunction = async () => redirect("/feed");
