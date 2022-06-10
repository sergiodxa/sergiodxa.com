import { Octokit } from "@octokit/core";
import "dotenv/config";
import { z } from "zod";

const { GITHUB_TOKEN, GITHUB_USERNAME, GITHUB_CONTENT_REPO } = z
  .object({
    GITHUB_TOKEN: z.string().nonempty(),
    GITHUB_USERNAME: z.string().nonempty(),
    GITHUB_CONTENT_REPO: z.string().nonempty(),
  })
  .parse(process.env);

export default new Octokit({ auth: GITHUB_TOKEN });
export { GITHUB_USERNAME, GITHUB_CONTENT_REPO };
