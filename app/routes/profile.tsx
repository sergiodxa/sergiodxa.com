import { useTranslation } from "react-i18next";

export default function Screen() {
  let { t } = useTranslation();
  return (
    <div>
      <h1>{t("Settings")}</h1>
    </div>
  );
}
