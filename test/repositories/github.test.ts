import { describe, expect } from "vitest";

import {
	GitHubFileNotFoundError,
	GithubRepository,
} from "~/repositories/github";

describe(GithubRepository.name, () => {
	let repo = new GithubRepository(process.env.GITHUB_TOKEN!);

	describe(repo.getMarkdownFile.name, () => {
		test("should throw if the file doesn't exists", async () => {
			await expect(repo.getMarkdownFile("not-found")).rejects.toThrowError(
				GitHubFileNotFoundError
			);
		});

		test("should return content if the file exists", async () => {
			await expect(
				repo.getMarkdownFile("tutorials/about.md")
			).resolves.toMatchObject({
				path: "content/tutorials/about.md",
				file: expect.any(Object),
			});
		});
	});
});
