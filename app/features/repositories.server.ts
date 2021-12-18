import type {
  FullRepository,
  Repository,
  RepositoryReadme,
} from "~/services/gh.server";
import { gh } from "~/services/gh.server";
import { GitHubRenderer, render } from "~/services/md.server";
import { pick } from "~/utils/objects";

export type ListOfRepositories = Pick<
  Repository,
  | "name"
  | "stargazers_count"
  | "description"
  | "id"
  | "updated_at"
  | "full_name"
>[];

export class Repositories {
  static async getList(page = 1): Promise<ListOfRepositories> {
    let response = await gh.request("GET /users/{org}/repos", {
      org: "sergiodxa",
      type: "owner",
      sort: "updated",
      page,
    });

    let repos: Repository[] = response.data ?? [];

    return pick(repos, [
      "id",
      "name",
      "stargazers_count",
      "description",
      "updated_at",
      "full_name",
    ]);
  }

  static async getSingle(
    slug: string
  ): Promise<{ title: string; body: string }> {
    let [repo, readme] = await Promise.all([
      this.getSingleRepository(slug),
      this.getRepoReadme(slug),
    ]);

    let markdown = Buffer.from(readme.content, "base64").toString("utf-8");
    let { full_name: title } = pick(repo, ["full_name"]);
    let body = render(markdown, {
      renderer: new GitHubRenderer(slug),
    });

    return { title, body };
  }

  private static async getSingleRepository(
    repo: string
  ): Promise<FullRepository> {
    let response = await gh.request("GET /repos/{owner}/{repo}", {
      owner: "sergiodxa",
      repo,
    });

    return response.data as FullRepository;
  }

  private static async getRepoReadme(repo: string): Promise<RepositoryReadme> {
    let response = await gh.request("GET /repos/{owner}/{repo}/readme", {
      owner: "sergiodxa",
      repo,
    });

    return response.data as RepositoryReadme;
  }
}
