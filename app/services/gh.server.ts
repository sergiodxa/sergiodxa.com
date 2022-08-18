import { Octokit } from "@octokit/core";

export class GitHubService {
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

		return data as unknown as string;
	}
}
