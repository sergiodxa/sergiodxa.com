import fetch, { Headers, Request, Response } from "node-fetch";
if (!globalThis.fetch) {
  // @ts-expect-error polyfill
  globalThis.fetch = fetch;
  // @ts-expect-error polyfill
  globalThis.Headers = Headers;
  // @ts-expect-error polyfill
  globalThis.Request = Request;
  // @ts-expect-error polyfill
  globalThis.Response = Response;
}
