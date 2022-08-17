import { Octokit } from "@octokit/core";

import { GITHUB_TOKEN, GITHUB_USERNAME } from "~/env";

const gh = new Octokit({ auth: GITHUB_TOKEN });

export async function deleteRepository(repo: string) {
	await gh.request("DELETE /repos/{owner}/{repo}", {
		owner: GITHUB_USERNAME,
		repo,
	});
}

export async function createRepository(name: string, description: string) {
	await gh.request("POST /user/repos", {
		name,
		private: true,
		has_issues: false,
		has_projects: false,
		has_wiki: false,
		description,
		allow_auto_merge: true,
		allow_merge_commit: false,
		allow_rebase_merge: false,
		delete_branch_on_merge: true,
	});
}

export async function pushFileToRepository(
	repo: string,
	path: string,
	message: string,
	content: Buffer
) {
	await gh.request("PUT /repos/{owner}/{repo}/contents/{path}", {
		owner: GITHUB_USERNAME,
		repo,
		path,
		message,
		committer: {
			name: "Sergio Xalambrí",
			email: "hello@sergiodxa.com",
		},
		content: content.toString("base64"),
	});
}
