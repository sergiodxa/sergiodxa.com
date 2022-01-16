import { LoaderFunction } from "remix";
import { RateLimit } from "~/services/rate-limit.server";

let rateLimit = new RateLimit();

export let loader: LoaderFunction = async ({ request }) => {
  await rateLimit.check("test", 10);
  return new Response("OK", { status: 200 });
};
