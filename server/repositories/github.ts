import { Octokit } from "@octokit/core";
import { z } from "zod";

import { MarkdownSchema } from "~/server/entities/markdown";

export class GithubRepository {
	#gh: Octokit;
	constructor(token: string) {
		this.#gh = new Octokit({ auth: token });
	}

	async getMarkdownFile(filename: string) {
		let path = `content/${filename}`;

		try {
			let response = await fetch(
				`https://raw.githubusercontent.com/sergiodxa/sergiodxa.com/main/${path}`,
			);

			if (!response.ok) throw new GitHubFileNotFoundError(path);

			let content = await response.text();

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

	async getListOfMarkdownFiles(path: string) {
		try {
			let { data } = await this.#gh.request(
				"GET /repos/{owner}/{repo}/contents/{path}",
				{
					owner: "sergiodxa",
					repo: "sergiodxa.com",
					path: `content/${path}`,
				},
			);

			return z
				.object({ name: z.string() })
				.array()
				.parse(data)
				.map((item) => item.name.slice(0, -3));
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
