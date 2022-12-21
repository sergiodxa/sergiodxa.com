import { Octokit } from "@octokit/core";
import { z } from "zod";

const isSponsoringMeSchema = z.object({
	node: z.object({
		__typename: z.enum(["User", "Organization"]),
		isSponsoringViewer: z.boolean(),
	}),
});

export interface IGitHubService {
	getArticleContent(slug: string): Promise<string>;
	isSponsoringMe(id: string): Promise<boolean>;
	getUserNodeId(username: string): Promise<string>;
	getOrganizationNodeId(org: string): Promise<string>;
}

export class GitHubService implements IGitHubService {
	private octokit: Octokit;

	constructor(private kv: KVNamespace, auth: string) {
		this.octokit = new Octokit({ auth });
	}

	async getArticleContent(slug: string) {
		let cached = await this.kv.get(slug, "text");
		if (cached !== null) return z.string().parse(cached);

		let { data } = await this.octokit.request(
			"GET /repos/{owner}/{repo}/contents/{path}",
			{
				owner: "sergiodxa",
				repo: "content",
				path: `articles/${slug}.md`,
				mediaType: { format: "raw" },
			}
		);

		let result = z.string().parse(data);

		this.kv.put(slug, result, { expirationTtl: 60 * 5 });

		return result;
	}

	async isSponsoringMe(id: string) {
		let result = await this.octokit.graphql(`
        query {
          node(id: "${id}") {
            __typename
            ... on Sponsorable {
              isSponsoringViewer
            }
          }
        }
      `);

		return isSponsoringMeSchema.parse(result).node.isSponsoringViewer;
	}

	async getUserNodeId(username: string) {
		let { data } = await this.octokit.request("GET /users/{username}", {
			username,
		});
		return data.node_id;
	}

	async getOrganizationNodeId(org: string) {
		let { data } = await this.octokit.request("GET /orgs/{org}", { org });
		return data.node_id;
	}
}
