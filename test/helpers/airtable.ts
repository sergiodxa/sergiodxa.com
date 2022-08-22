import type { IAirtableService } from "~/services/airtable";

import { vi } from "vitest";

export class AirtableMockService implements IAirtableService {
	getBookmarks = vi.fn();
}
