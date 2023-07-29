import type { LoaderArgs } from "@remix-run/cloudflare";

import avatar from "~/assets/avatar.png";

export function loader({request}: LoaderArgs) {
  let url = new URL(avatar, request.url);
  return fetch(url);
}