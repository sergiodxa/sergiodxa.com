import type { IGitHubService } from "~/services/gh";

import { vi } from "vitest";

export class GitHubMockService implements IGitHubService {
	getArticleContent = vi.fn();
}
