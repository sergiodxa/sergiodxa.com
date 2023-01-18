type ContentTypes =
	| "all"
	| "text"
	| "html"
	| "js"
	| "ics"
	| "csv"
	| "xml"
	| "yaml"
	| "rss"
	| "atom"
	| "json"
	| "pdf"
	| "webmanifest"
	| "css";

type Handlers = {
	[ContentType in ContentTypes]?: () => Response | Promise<Response>;
};

export function respondTo(
	headers: Headers,
	handlers: Handlers
): Response | Promise<Response>;
export function respondTo(
	request: Request,
	handlers: Handlers
): Response | Promise<Response>;
export function respondTo(
	requestOrHeaders: Request | Headers,
	handlers: Handlers
): Response | Promise<Response> {
	let headers: Headers =
		requestOrHeaders instanceof Request
			? requestOrHeaders.headers
			: requestOrHeaders;

	let headerContentType = headers.get("content-type") ?? "";

	let contentType: ContentTypes = "all";

	if (headerContentType.includes("text/plain")) contentType = "text";

	if (headerContentType.includes("text/html")) contentType = "html";
	if (headerContentType.includes("application/xhtml+xml")) contentType = "html";

	if (headerContentType.includes("text/javascript")) contentType = "js";
	if (headerContentType.includes("application/javascript")) contentType = "js";
	if (headerContentType.includes("application/x-javascript")) {
		contentType = "js";
	}

	if (headerContentType.includes("text/calendar")) contentType = "ics";

	if (headerContentType.includes("text/csv")) contentType = "csv";

	if (headerContentType.includes("application/xml")) contentType = "xml";
	if (headerContentType.includes("text/xml")) contentType = "xml";
	if (headerContentType.includes("application/x-xml")) contentType = "xml";

	if (headerContentType.includes("text/yaml")) contentType = "yaml";
	if (headerContentType.includes("application/yaml")) contentType = "yaml";
	if (headerContentType.includes("application/x-yaml")) contentType = "yaml";

	if (headerContentType.includes("application/rss+xml")) contentType = "rss";

	if (headerContentType.includes("application/atom+xml")) contentType = "atom";

	if (headerContentType.includes("application/json")) contentType = "json";
	if (headerContentType.includes("text/x-json")) contentType = "json";

	if (headerContentType.includes("application/pdf")) contentType = "pdf";

	if (headerContentType.includes("application/manifest+json")) {
		contentType = "webmanifest";
	}

	if (headerContentType.includes("text/css")) contentType = "css";

	if (contentType in handlers && handlers[contentType] instanceof Function) {
		return handlers[contentType]!();
	}

	if ("all" in handlers && handlers.all instanceof Function) {
		return handlers.all();
	}

	return new Response("Unsupported Media Type", { status: 415 });
}
