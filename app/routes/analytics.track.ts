import { json } from "@remix-run/node";

export let action: SDX.ActionFunction = async ({ request }) => {
  let { searchParams } = new URL(request.url);

  switch (searchParams.get("event")) {
    case "article:read": {
      let slug = searchParams.get("slug");
      console.log(slug);
      break;
    }
  }

  return json(null);
};
