import { ok } from "~/helpers/response";
import { getI18nextInstance, getLocale } from "~/middleware/i18next";
import { Editor } from "~/routes/components.editor/route";
import type { Route } from "./+types/route";

export async function loader({ request }: Route.LoaderArgs) {
	let i18n = getI18nextInstance();
	let t = i18n.getFixedT(getLocale());

	let meta: Route.MetaDescriptors = [{ title: t("write.title") }];

	return ok({ meta });
}

export const meta: Route.MetaFunction = ({ data }) => data?.meta ?? [];

export default function Component() {
	return (
		<main className="mx-auto max-w-screen-xl">
			<Editor key="editor" />
		</main>
	);
}
