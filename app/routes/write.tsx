import type {
	DataFunctionArgs,
	V2_MetaDescriptor,
	V2_MetaFunction,
} from "@remix-run/cloudflare";

import { json } from "@remix-run/cloudflare";

import { i18n } from "~/i18n.server";
import { Editor } from "~/routes/components.editor/route";

export let handle: SDX.Handle = { hydrate: true };

export async function loader({ request }: DataFunctionArgs) {
	let t = await i18n.getFixedT(request);

	let meta: V2_MetaDescriptor[] = [{ title: t("write.title") }];

	return json({ meta });
}

export let meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	return data?.meta ?? [];
};

export default function Component() {
	return (
		<main className="mx-auto max-w-screen-xl">
			<Editor />
		</main>
	);
}
