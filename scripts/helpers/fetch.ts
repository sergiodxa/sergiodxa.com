import fetch, { Headers, Request, Response } from "@remix-run/web-fetch";
if (!globalThis.fetch) {
  // @ts-expect-error polyfill
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  // @ts-expect-error polyfill
  globalThis.Request = Request;
  // @ts-expect-error polyfill
  globalThis.Response = Response;
}
