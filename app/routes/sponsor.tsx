import { useTranslation } from "react-i18next";
import { json, LoaderFunction, useLoaderData, useSearchParams } from "remix";
import { Header } from "~/components/header";
import { Region } from "~/components/heading";
import { Frequency, Pricing, Tier } from "~/components/pricing";
import { i18n } from "~/services/i18n.server";

type LoaderData = {
  locale: string;
};

export let loader: LoaderFunction = async ({ request }) => {
  let locale = await i18n.getLocale(request);
  return json<LoaderData>({ locale });
};

export default function Screen() {
  let { locale } = useLoaderData<LoaderData>();
  let { t } = useTranslation();

  let [searchParams] = useSearchParams();
  let frequency = (searchParams.get("frequency") ?? "monthly") as Frequency;

  let monthlyTiers: Tier[] = [
    {
      id: 74849,
      price: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
      }).format(5),
      includedFeatures: [t("Get a Sponsor badge on your profile.")],
    },
    {
      id: 74851,
      price: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
      }).format(100),
      includedFeatures: [
        t("I'll join your company chat app for help and support."),
      ],
    },
  ];
  let oneTimeTiers: Tier[] = [
    {
      id: 83905,
      price: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
      }).format(100),
      includedFeatures: [t("One hour of personal 1 on 1 mentorship.")],
    },
    {
      id: 74854,
      price: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
      }).format(10_000),
      includedFeatures: [t("Large contract project - contact me!")],
    },
  ];

  let tiers = frequency === "monthly" ? monthlyTiers : oneTimeTiers;

  return (
    <Region>
      <Header />
      <Pricing tiers={tiers} frequency={frequency} />
    </Region>
  );
}
