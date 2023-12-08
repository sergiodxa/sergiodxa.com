import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";
import { z } from "zod";

import { MarkdownSchema } from "~/server/entities/markdown";

export class GitHub {
	private octokit: Octokit;

	constructor(appId: string, privateKey: string) {
		this.octokit = new Octokit({
			auth: { appId, privateKey, installationId: 44808893 },
			authStrategy: createAppAuth,
		});
	}

	async fetchMarkdownFile(filename: string) {
		let path = filename.startsWith("content/")
			? filename
			: `content/${filename}`;

		try {
			let response = await this.octokit.request(
				"GET /repos/{owner}/{repo}/contents/{path}",
				{
					owner: "sergiodxa",
					repo: "sergiodxa.com",
					path,
				},
			);

			if (Array.isArray(response.data)) throw new GitHubError("Not a file");
			if (response.data.type !== "file") throw new GitHubError("Not a file");

			let content = atob(response.data.content);

			return z
				.object({ path: z.string(), file: MarkdownSchema })
				.parse({ path, file: content });
		} catch (error) {
			if (
				error instanceof Error &&
				error.name === "HttpError" &&
				error.message === "Not Found"
			) {
				throw new GitHubError(path);
			}

			throw error;
		}
	}

	async listMarkdownFiles(path: string) {
		try {
			let response = await this.octokit.request(
				"GET /repos/{owner}/{repo}/contents/{path}",
				{ owner: "sergiodxa", repo: "sergiodxa.com", path: `content/${path}` },
			);

			if (!Array.isArray(response.data)) throw new GitHubError("Not a folder");

			return response.data.map((item) => {
				if (item.type !== "file") throw new GitHubError("Not a file");
				return item.path;
			});
		} catch (error) {
			if (
				error instanceof Error &&
				error.name === "HttpError" &&
				error.message === "Not Found"
			) {
				throw new GitHubError(path);
			}

			throw error;
		}
	}
}

export class GitHubError extends Error {
	name = "GitHubError";
}
