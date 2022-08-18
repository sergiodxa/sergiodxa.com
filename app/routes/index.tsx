import { useT } from "~/helpers/use-i18n.hook";

export default function Index() {
	let t = useT();
	return <h1 className="hover:bg-blue bg-red">{t("It works!")}</h1>;
}
