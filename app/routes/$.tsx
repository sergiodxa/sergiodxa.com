import { useTranslation } from "react-i18next";

export default function Component() {
	let { t } = useTranslation();

	return (
		<main>
			<h1>{t("notFound.title")}</h1>
		</main>
	);
}
