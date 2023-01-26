import type { TFunction } from "i18next";

import { Trans } from "react-i18next";

type Props = { t: TFunction };

export function PageHeader({ t }: Props) {
	return (
		<header>
			<h1 className="text-3xl font-bold tracking-tight text-gray-900">
				{t("header.title")}
			</h1>

			<Trans
				parent="p"
				className="text-xl text-gray-800"
				t={t}
				i18nKey="header.description"
			/>
		</header>
	);
}
