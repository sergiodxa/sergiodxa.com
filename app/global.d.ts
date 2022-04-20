import {
  type DynamicLinksFunction,
  type ExternalScriptsFunction,
  type StructuredDataFunction,
} from "remix-utils";

export namespace SDX {
  export type Handle<LoaderData = unknown> = {
    i18n?: string | string[];
    hydrate?: boolean | ((data: LoaderData) => boolean);
    scripts?: ExternalScriptsFunction;
    dynamicLinks?: DynamicLinksFunction<LoaderData>;
    structuredData?: StructuredDataFunction<LoaderData>;
  };
}
