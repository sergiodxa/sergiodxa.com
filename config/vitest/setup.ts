import { installGlobals } from "@remix-run/node";
import dotenv from "dotenv";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "../../mocks";

import "@testing-library/jest-dom/extend-expect";

dotenv.config({ override: true });

installGlobals();

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());
