import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";
import { z } from "zod";

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
				{ owner: "sergiodxa", repo: "sergiodxa.com", path },
			);

			if (Array.isArray(response.data)) throw new GitHubError("Not a file");
			if (response.data.type !== "file") throw new GitHubError("Not a file");

			let createdAt = await this.fetchFileFirstCommitDate(path);

			return { content: atob(response.data.content), createdAt };
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

	async fetchFileFirstCommitDate(path: string) {
		try {
			// Fetch commits for the file
			let response = await this.octokit.request(
				"GET /repos/{owner}/{repo}/commits",
				{
					owner: "sergiodxa",
					repo: "sergiodxa.com",
					path,
				},
			);

			// The commits are in reverse chronological order
			let commits = response.data;

			// The date of the first commit is the creation date of the file
			return commits.at(-1)?.commit.author?.date;
		} catch {
			return null;
		}
	}

	async isSponsoringMe(id: string) {
		let result = await this.octokit.graphql(`query {
	node(id: "${id}") {
		... on Sponsorable {
			isSponsoringViewer
		}
	}
}`);

		return z
			.object({ node: z.object({ isSponsoringViewer: z.boolean() }) })
			.parse(result).node.isSponsoringViewer;
	}
}

export class GitHubError extends Error {
	override name = "GitHubError";
}
