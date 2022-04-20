import {
  CheckCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Link } from "@remix-run/react";
import { hasAny } from "../utils/arrays";

type AlertType = "success" | "info" | "warning" | "danger";

type AlertAction = {
  label: ReactNode;
  onClick(): void;
};

type AlertLinkType = {
  label: ReactNode;
  icon?: ReactNode;
  href: string;
};

type AlertMessage = ReactNode | ReactNode[];

type AlertBaseProps = {
  type: AlertType;
  actions?: AlertAction[];
  link?: AlertLinkType;
};

type AlertProps = AlertBaseProps &
  (
    | { title: ReactNode; body?: AlertMessage }
    | { title?: ReactNode; body: AlertMessage }
  );

export function Alert({ type, title, body, actions, link }: AlertProps) {
  return (
    <div
      className={clsx("rounded-md p-4", {
        "bg-yellow-50": type === "warning",
        "bg-red-50": type === "danger",
        "bg-blue-50": type === "info",
        "bg-green-50": type === "success",
      })}
    >
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <AlertIcon type={type} />
        </div>
        <div className="flex-1 md:flex md:justify-between">
          <div className="space-y-4 w-full">
            <div className="space-y-2">
              {title && (
                <h3
                  className={clsx("text-sm font-medium", {
                    "text-yellow-800": type === "warning",
                    "text-red-800": type === "danger",
                    "text-blue-800": type === "info",
                    "text-green-800": type === "success",
                  })}
                >
                  {title}
                </h3>
              )}
              {body && (
                <div
                  className={clsx("text-sm", {
                    "text-yellow-700": type === "warning",
                    "text-red-700": type === "danger",
                    "text-blue-700": type === "info",
                    "text-green-700": type === "success",
                  })}
                >
                  {Array.isArray(body) ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {body.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{body}</p>
                  )}
                </div>
              )}
            </div>
            {actions && hasAny(actions) && (
              <div>
                <div className="-mx-2 -my-1.5 flex space-x-1">
                  {actions.map((action) => {
                    return (
                      <button
                        key={action.label?.toString()}
                        type="button"
                        className={clsx(
                          " px-2 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
                          {
                            "bg-yellow-50 text-yellow-800 hover:bg-yellow-100 focus:ring-offset-yellow-50 focus:ring-yellow-600":
                              type === "warning",
                            "bg-red-50 text-red-800 hover:bg-red-100 focus:ring-offset-red-50 focus:ring-red-600":
                              type === "danger",
                            "bg-blue-50 text-blue-800 hover:bg-blue-100 focus:ring-offset-blue-50 focus:ring-blue-600":
                              type === "info",
                            "bg-green-50 text-green-800 hover:bg-green-100 focus:ring-offset-green-50 focus:ring-green-600":
                              type === "success",
                          }
                        )}
                        onClick={action.onClick}
                      >
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {link && (
            <p className="mt-3 text-sm md:mt-0 md:ml-6">
              <AlertLink {...link} type={type} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertIcon({ type }: Pick<AlertProps, "type">) {
  switch (type) {
    case "success":
      return (
        <CheckCircleIcon
          aria-hidden="true"
          className="h-5 w-5 text-green-400"
        />
      );
    case "info":
      return (
        <InformationCircleIcon
          aria-hidden="true"
          className="h-5 w-5 text-blue-400"
        />
      );
    case "warning":
      return (
        <ExclamationIcon
          aria-hidden="true"
          className="h-5 w-5 text-yellow-400"
        />
      );
    case "danger":
      return (
        <XCircleIcon aria-hidden="true" className="h-5 w-5 text-red-400" />
      );
  }
}

function AlertLink({
  type,
  label,
  icon,
  href,
}: AlertLinkType & { type: AlertType }) {
  if (isExternalLink(href)) {
    return (
      <a
        href={href}
        className={clsx("whitespace-nowrap", {
          "text-yellow-700 hover:text-yellow-600": type === "warning",
          "text-red-700 hover:text-red-600": type === "danger",
          "text-blue-700 hover:text-blue-600": type === "info",
          "text-green-700 hover:text-green-600": type === "success",
        })}
      >
        {label}{" "}
        {icon === undefined ? <span aria-hidden="true">&rarr;</span> : icon}
      </a>
    );
  }
  return (
    <Link
      to={href}
      className={clsx("whitespace-nowrap", {
        "text-yellow-700 hover:text-yellow-600": type === "warning",
        "text-red-700 hover:text-red-600": type === "danger",
        "text-blue-700 hover:text-blue-600": type === "info",
        "text-green-700 hover:text-green-600": type === "success",
      })}
    >
      {label}{" "}
      {icon === undefined ? <span aria-hidden="true">&rarr;</span> : icon}
    </Link>
  );
}

function isExternalLink(href: string) {
  return href.startsWith("http") || href.startsWith("mailto");
}
