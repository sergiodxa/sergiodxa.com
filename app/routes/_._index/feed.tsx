import type { TFunction } from "i18next";
import { BookIcon, BookmarkIcon, PencilIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "~/ui/Link";
import { cn } from "~/utils/cn";
import type { FeedItem } from "./types";

type Props = {
	t: TFunction<"translation", "home">;
	items: FeedItem[];
};

export function FeedList({ t, items }: Props) {
	return (
		<ol aria-label={t("feed.title") as string} className="h-feed">
			{items.map((item, index) => {
				if (item.type === "article") {
					return (
						<Item
							key={item.id}
							index={index}
							size={items.length - 1}
							body={
								<Trans
									parent="p"
									className="text-sm text-zinc-800 dark:text-zinc-200"
									i18nKey="feed.article"
									t={t}
									values={{ title: item.payload.title }}
									components={{
										"link:article": (
											<Link href={item.payload.link} prefetch="intent" />
										),
									}}
								/>
							}
							icon={<PencilIcon className="size-5 text-white" aria-hidden />}
							iconColor="bg-amber-500"
							createdAt={new Date(item.payload.createdAt)}
						/>
					);
				}

				if (item.type === "tutorial") {
					return (
						<Item
							key={item.id}
							index={index}
							size={items.length - 1}
							body={
								<Trans
									parent="p"
									className="text-sm text-zinc-800 dark:text-zinc-200"
									i18nKey="feed.tutorial"
									t={t}
									values={{ title: item.payload.title }}
									components={{
										"link:tutorial": (
											<Link href={item.payload.link} prefetch="intent" />
										),
									}}
								/>
							}
							icon={<PencilIcon className="size-5 text-white" aria-hidden />}
							iconColor="bg-amber-500"
							createdAt={new Date(item.payload.createdAt)}
						/>
					);
				}

				if (item.type === "bookmark") {
					return (
						<Item
							key={item.id}
							index={index}
							size={items.length - 1}
							body={
								<Trans
									parent="p"
									className="text-sm text-zinc-800 dark:text-zinc-200"
									i18nKey="feed.bookmark"
									t={t}
									values={{ title: item.payload.title }}
									components={{
										"link:bookmark": (
											<Link href={item.payload.link} rel="nofollow noreferer" />
										),
									}}
								/>
							}
							icon={<BookmarkIcon className="size-5 text-white" aria-hidden />}
							iconColor="bg-blue-400"
							createdAt={new Date(item.payload.createdAt)}
						/>
					);
				}

				if (item.type === "glossary") {
					return (
						<Item
							key={item.id}
							index={index}
							size={items.length - 1}
							body={
								<Trans
									parent="p"
									className="text-sm text-zinc-800 dark:text-zinc-200"
									i18nKey="feed.glossary"
									t={t}
									values={{ title: item.payload.title }}
									components={{
										"link:glossary": (
											<Link href={item.payload.link} prefetch="intent" />
										),
									}}
								/>
							}
							icon={<BookIcon className="size-5 text-white" aria-hidden />}
							iconColor="bg-blue-400"
							createdAt={new Date(item.payload.createdAt)}
						/>
					);
				}

				return null;
			})}
		</ol>
	);
}

type FeedItemProps = {
	body: ReactNode;
	index: number;
	size: number;
	icon: ReactNode;
	iconColor: string;
	createdAt: Date;
};

function Item({
	body,
	index,
	size,
	iconColor,
	icon,
	createdAt,
}: FeedItemProps) {
	let { i18n } = useTranslation("translation");

	return (
		<li className="h-entry">
			<div className="relative pb-8">
				{index !== size ? (
					<span
						className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-white dark:bg-zinc-900"
						aria-hidden
					/>
				) : null}
				<div className="relative flex space-x-3">
					<div>
						<span
							className={cn(
								iconColor,
								"flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-zinc-900",
							)}
						>
							{icon}
						</span>
					</div>
					<div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
						{body}

						<div className="whitespace-nowrap text-right text-sm tabular-nums text-zinc-500">
							<time dateTime={createdAt.toISOString()}>
								{createdAt.toLocaleDateString(i18n.language, {
									month: "short",
									day: "2-digit",
									year: "2-digit",
								})}
							</time>
						</div>
					</div>
				</div>
			</div>
		</li>
	);
}
