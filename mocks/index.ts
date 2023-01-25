import { rest } from "msw";
import { setupServer } from "msw/node";

import { github } from "./github.mock";

let misc = [
	rest.get(/http:\/\/localhost:\d+\/.*/, async (req) => req.passthrough()),
	rest.post(/http:\/\/localhost:\d+\/.*/, async (req) => req.passthrough()),
];

export const server = setupServer(...misc, ...github);
