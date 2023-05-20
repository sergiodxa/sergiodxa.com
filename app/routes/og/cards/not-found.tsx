import type { TFunction } from "i18next";

/* eslint-disable react/no-unknown-property */
declare module "react" {
	interface HTMLAttributes<T> {
		tw?: string;
	}
}

type Props = { avatarURL: URL; locale: string; t: TFunction; slug: string };

export function NotFound({ avatarURL, locale, t, slug }: Props) {
	return (
		<div
			lang={locale}
			tw="w-screen h-screen flex items-center justify-center relative"
			style={{ fontFamily: "Inter" }}
		>
			<img
				src={avatarURL.toString()}
				width={128}
				height={128}
				alt=""
				tw="absolute left-4 top-4"
			/>
			<h1 tw="flex flex-col font-bold text-5xl">
				{t("og.notFound.title", {
					slug,
					interpolation: { escapeValue: false },
				})}
			</h1>
		</div>
	);
}
