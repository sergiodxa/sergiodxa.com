import { http, passthrough } from "msw";
import { setupServer } from "msw/node";

import { github } from "./github.mock";

let misc = [
	http.get(/http:\/\/localhost:\d+\/.*/, passthrough),
	http.post(/http:\/\/localhost:\d+\/.*/, passthrough),
];

export const server = setupServer(...misc, ...github);
