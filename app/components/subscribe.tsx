import type { TFunction } from "i18next";

import { Trans } from "react-i18next";

import { Link } from "~/ui/Link";

type SubscribeProps = {
	t: TFunction<"translation", "tutorials" | "bookmarks" | "home" | "articles">;
};

export function Subscribe({ t }: SubscribeProps) {
	return (
		<Trans
			t={t}
			parent="p"
			className="text-zing-600 text-sm dark:text-zinc-400"
			i18nKey="subscribe.cta"
			components={{
				rss: <Link href="/rss" className="text-blue-600 underline" />,
			}}
		/>
	);
}
