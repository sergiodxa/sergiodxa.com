import { Octokit } from "@octokit/core";
import { z } from "zod";

export interface IGitHubService {
	getArticleContent(slug: string): Promise<string>;
}

export class GitHubService implements IGitHubService {
	private octokit: Octokit;

	constructor(auth: string) {
		this.octokit = new Octokit({ auth });
	}

	async getArticleContent(slug: string) {
		let { data } = await this.octokit.request(
			"GET /repos/{owner}/{repo}/contents/{path}",
			{
				owner: "sergiodxa",
				repo: "content",
				path: `articles/${slug}.md`,
				mediaType: { format: "raw" },
			}
		);

		return z.string().parse(data);
	}
}
