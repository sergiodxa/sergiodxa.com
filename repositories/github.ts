import { Octokit } from "@octokit/core";
import { z } from "zod";

import { MarkdownSchema } from "~/entities/markdown";

const FileContentSchema = z.object({
	type: z.literal("file"),
	content: z.string().transform((value) => atob(value)),
});

export class GithubRepository {
	#octokit: Octokit;

	constructor(token: string) {
		this.#octokit = new Octokit({
			auth: token,
			baseUrl: "https://api.github.com",
		});
	}

	async getMarkdownFile(filename: string) {
		let path = `content/${filename}`;

		try {
			let result = await this.#octokit.request(
				"GET /repos/{owner}/{repo}/contents/{path}",
				{ owner: "sergiodxa", repo: "sergiodxa.com", path }
			);

			if (!result.data) throw new GitHubFileNotFoundError(path);

			let { content } = FileContentSchema.parse(result.data);

			return z
				.object({
					path: z.string(),
					file: MarkdownSchema,
				})
				.parse({ path, file: content });
		} catch (error) {
			if (
				error instanceof Error &&
				error.name === "HttpError" &&
				error.message === "Not Found"
			) {
				throw new GitHubFileNotFoundError(path);
			}

			throw error;
		}
	}
}

export class GitHubFileNotFoundError extends Error {
	constructor(path: string) {
		super(`File ${path} not found`);
	}
}
