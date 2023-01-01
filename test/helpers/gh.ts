import type { IGitHubService } from "~/gh";

import { vi } from "vitest";

export class GitHubMockService implements IGitHubService {
	getArticleContent = vi.fn();
}
