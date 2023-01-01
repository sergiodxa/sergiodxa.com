import type { ICollectedNotesService } from "~/cn";

import { vi } from "vitest";

export class CollectedNotesMockService implements ICollectedNotesService {
	getNotes = vi.fn();
	getLatestNotes = vi.fn();
	searchNotes = vi.fn();
	readNote = vi.fn();
}
