import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { getI18nextInstance } from "./middleware/i18next";

export default async function handleRequest(
	request: Request,
	status: number,
	headers: Headers,
	entryContext: EntryContext,
) {
	let userAgent = request.headers.get("user-agent");

	let stream = await renderToReadableStream(
		<I18nextProvider i18n={getI18nextInstance()}>
			<ServerRouter context={entryContext} url={request.url} />
		</I18nextProvider>,
		{
			signal: request.signal,
			onError(error) {
				console.error(error);
				// biome-ignore lint/style/noParameterAssign: It's ok
				status = 500;
			},
		},
	);

	if (userAgent && isbot(userAgent)) await stream.allReady;
	else headers.set("Transfer-Encoding", "chunked");

	headers.set("Content-Type", "text/html; charset=utf-8");

	return new Response(stream, { status, headers });
}
