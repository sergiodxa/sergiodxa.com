import { z } from "zod";

export const {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE,
  BASE_URL,
  CN_EMAIL,
  CN_SITE,
  CN_TOKEN,
  COOKIE_SESSION_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CONTENT_REPO,
  GITHUB_TOKEN,
  GITHUB_USERNAME,
  NODE_ENV,
} = z
  .object({
    AIRTABLE_API_KEY: z.string().nonempty(),
    AIRTABLE_BASE: z.string().nonempty(),
    BASE_URL: z.string().nonempty().url(),
    CN_EMAIL: z.string().nonempty().email(),
    CN_SITE: z.string().nonempty(),
    CN_TOKEN: z.string().nonempty(),
    COOKIE_SESSION_SECRET: z.string().nonempty(),
    GITHUB_CLIENT_ID: z.string().nonempty(),
    GITHUB_CLIENT_SECRET: z.string().nonempty(),
    GITHUB_CONTENT_REPO: z.string().nonempty(),
    GITHUB_TOKEN: z.string().nonempty(),
    GITHUB_USERNAME: z.string().nonempty(),
    NODE_ENV: z
      .union([
        z.literal("test"),
        z.literal("development"),
        z.literal("production"),
      ])
      .default("development"),
  })
  .parse(process.env);
