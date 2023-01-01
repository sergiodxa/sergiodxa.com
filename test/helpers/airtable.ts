import type { IAirtableService } from "~/airtable";

import { vi } from "vitest";

export class AirtableMockService implements IAirtableService {
	getBookmarks = vi.fn();
}
