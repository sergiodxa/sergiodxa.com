import type { TFunction } from "i18next";

type Props = { t: TFunction };

export function PageHeader({ t }: Props) {
	return (
		<header>
			<h2 className="text-3xl font-bold tracking-tight text-gray-900">
				{t("header.title")}
			</h2>
			<p className="text-xl text-gray-800">{t("header.description")}</p>
		</header>
	);
}
