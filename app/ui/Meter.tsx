import type { MeterProps as AriaMeterProps } from "react-aria-components";

import { AlertTriangle } from "lucide-react";
import { Meter as AriaMeter } from "react-aria-components";

import { Label } from "./Field";
import { composeTailwindRenderProps } from "./utils";

export interface MeterProps extends AriaMeterProps {
	label?: string;
}

export function Meter({ label, ...props }: MeterProps) {
	return (
		<AriaMeter
			{...props}
			className={composeTailwindRenderProps(
				props.className,
				"flex flex-col gap-1",
			)}
		>
			{({ percentage, valueText }) => (
				<>
					<div className="flex justify-between gap-2">
						<Label>{label}</Label>
						<span
							className={`text-sm ${
								percentage >= 80
									? "text-red-600 dark:text-red-500"
									: "text-gray-600 dark:text-zinc-400"
							}`}
						>
							{percentage >= 80 && (
								<AlertTriangle
									aria-label="Alert"
									className="inline-block h-4 w-4 align-text-bottom"
								/>
							)}
							{` ${valueText}`}
						</span>
					</div>
					<div className="relative h-2 w-64 rounded-full bg-gray-300 outline outline-1 -outline-offset-1 outline-transparent dark:bg-zinc-700">
						<div
							className={`absolute left-0 top-0 h-full rounded-full ${getColor(
								percentage,
							)} forced-colors:bg-[Highlight]`}
							style={{ width: `${percentage}%` }}
						/>
					</div>
				</>
			)}
		</AriaMeter>
	);
}

function getColor(percentage: number) {
	if (percentage < 70) {
		return "bg-green-600";
	}

	if (percentage < 80) {
		return "bg-orange-500";
	}

	return "bg-red-600";
}
