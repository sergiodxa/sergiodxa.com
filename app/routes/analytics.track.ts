import { json, type ActionArgs } from "@remix-run/node";

export async function action({ request }: ActionArgs) {
  let { searchParams } = new URL(request.url);

  switch (searchParams.get("event")) {
    case "article:read": {
      let slug = searchParams.get("slug");
      console.log(slug);
      break;
    }
  }

  return json(null);
}
