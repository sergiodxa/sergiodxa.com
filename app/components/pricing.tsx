import { CheckIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Link } from "remix";
import { Heading } from "./heading";

export type Tier = {
  id: number;
  price: string;
  includedFeatures: Array<string>;
};

export type Frequency = "monthly" | "one-time";

type Props = {
  tiers: Tier[];
  frequency: Frequency;
};

export function Pricing({ tiers, frequency }: Props) {
  let { t } = useTranslation();

  let tabs: Array<{ frequency: Frequency; label: string }> = [
    { frequency: "monthly", label: t("Monthly Support") },
    { frequency: "one-time", label: t("One-time Support") },
  ];

  return (
    <div className="bg-gray-900">
      <div className="pt-12 sm:pt-16 lg:pt-24">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-2 lg:max-w-none">
            <Heading className="text-lg leading-6 font-semibold text-gray-300 uppercase tracking-wider">
              {t("Sponsorship Tiers")}
            </Heading>
            <p className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              {t("Support my Open Source and content work.")}
            </p>
            <p className="text-xl text-gray-300">
              {t(
                "All the money from my sponsors will let me continue to develop and maintain my Open Source projects and create more content."
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 pb-12 bg-white sm:mt-12 sm:pb-16 lg:mt-16 lg:pb-24">
        <div className="relative">
          <div className="absolute inset-0 h-3/4 bg-gray-900" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col align-center">
              <div className="relative self-center mb-6 bg-gray-100 rounded-lg p-0.5 flex sm:mb-12 mx-auto">
                {tabs.map((tab) => {
                  let isActive = tab.frequency === frequency;
                  return (
                    <Link
                      key={tab.frequency}
                      to={`?frequency=${tab.frequency}`}
                      className={clsx(
                        "relative w-1/2 rounded-md shadow-sm py-2 text-sm font-medium  whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:w-auto sm:px-8",
                        {
                          "bg-white border-gray-200 text-gray-900": isActive,
                          "border-transparent text-gray-700": !isActive,
                        }
                      )}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-4 lg:max-w-5xl lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
              {tiers.map((tier) => {
                let url = new URL(
                  "https://github.com/sponsors/sergiodxa/sponsorships"
                );
                url.searchParams.set("tier_id", tier.id.toString());
                return (
                  <div
                    key={tier.id}
                    className="flex flex-col rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6">
                      <div className="mt-4 flex items-baseline text-6xl font-extrabold">
                        {tier.price}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-50 space-y-6 sm:p-10 sm:pt-6">
                      <ul role="list" className="space-y-4">
                        {tier.includedFeatures.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <div className="flex-shrink-0">
                              <CheckIcon
                                className="h-6 w-6 text-green-500"
                                aria-hidden="true"
                              />
                            </div>
                            <p className="ml-3 text-base text-gray-700">
                              {feature}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <div className="rounded-md shadow">
                        <a
                          href={url.toString()}
                          className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900"
                          aria-describedby="tier-standard"
                        >
                          {t("Select")}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <Heading className="text-5xl font-extrabold text-gray-900 sm:text-center">
            {t("Sponsorship Tiers")}
          </Heading>
          {/* <p className="mt-5 text-xl text-gray-500 sm:text-center">
            {t(
              "Start building for free, then add a site plan to go live. Account plans unlock additional features."
            )}
          </p> */}
          <div className="relative self-center mt-6 bg-gray-100 rounded-lg p-0.5 flex sm:mt-8">
            {tabs.map((tab) => {
              let isActive = tab.frequency === frequency;
              return (
                <Link
                  key={tab.frequency}
                  to={`?frequency=${tab.frequency}`}
                  className={clsx(
                    "relative w-1/2 rounded-md shadow-sm py-2 text-sm font-medium  whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:w-auto sm:px-8",
                    {
                      "bg-white border-gray-200 text-gray-900": isActive,
                      "border-transparent text-gray-700": !isActive,
                    }
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
          {tiers.map((tier) => {
            let url = new URL(
              "https://github.com/sponsors/sergiodxa/sponsorships"
            );
            url.searchParams.set("tier_id", tier.id.toString());
            return (
              <div
                key={tier.price}
                className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
              >
                <div className="p-6">
                  {/* <h2 className="text-lg leading-6 font-medium text-gray-900">
                  {tier.name}
                </h2> */}
                  {/* <p className="mt-4 text-sm text-gray-500">{tier.description}</p> */}
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {tier.price}
                    </span>
                  </p>
                  <a
                    href={url.toString()}
                    className="mt-8 block w-full bg-gray-800 border border-gray-800 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900"
                  >
                    {t("Select")}
                  </a>
                </div>
                <div className="pt-6 pb-8 px-6">
                  <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                    {t("What's included")}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {tier.includedFeatures.map((feature) => (
                      <li key={feature} className="flex space-x-3">
                        <CheckIcon
                          className="flex-shrink-0 h-5 w-5 text-green-500"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
