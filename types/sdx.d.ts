import type { PrismaClient } from "@prisma/client";
import type { DataFunctionArgs } from "@remix-run/node";
import type {
  DynamicLinksFunction,
  ExternalScriptsFunction,
  StructuredDataFunction,
} from "remix-utils";
import type { Logger } from "winston";

declare global {
  namespace SDX {
    export interface Context {
      db: PrismaClient;
      logger: Logger;
    }

    export interface LoaderFunction {
      (
        args: Pick<DataFunctionArgs, "request" | "params"> & {
          context: Context;
        }
      ): Promise<Response> | Response;
    }

    export interface ActionFunction {
      (
        args: Pick<DataFunctionArgs, "request" | "params"> & {
          context: Context;
        }
      ): Promise<Response> | Response;
    }

    export type Handle<LoaderData = unknown> = {
      i18n?: string | string[];
      hydrate?: boolean | ((data: LoaderData) => boolean);
      scripts?: ExternalScriptsFunction;
      dynamicLinks?: DynamicLinksFunction<LoaderData>;
      structuredData?: StructuredDataFunction<LoaderData>;
    };
  }
}
