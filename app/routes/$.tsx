import type { DataFunctionArgs } from "@remix-run/cloudflare";

import { redirect } from "@remix-run/cloudflare";

import { useT } from "~/helpers/use-i18n.hook";

export async function loader({ request }: DataFunctionArgs) {
	let url = new URL(request.url);

	let isPHP = url.pathname.endsWith(".php");

	if (isPHP) throw redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

	return redirect("/");
}

export default function Component() {
	let t = useT("translation", "notFound");

	return <h1>{t("title")}</h1>;
}
