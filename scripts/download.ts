import matter from "gray-matter";
import "dotenv/config";
import "./helpers/fetch";
import { GITHUB_CONTENT_REPO } from "~/env";
import { downloadAllArticles } from "~/services/cn.server";
import {
  createRepository,
  deleteRepository,
  pushFileToRepository,
} from "~/services/gh.server";

async function migrateArticles() {
  console.info("Downloading articles from Collected Notes");

  let notes = await downloadAllArticles();

  console.info("Total articles downloaded %d", notes.length);

  let noteList = notes.map((note) => {
    let { data, content } = matter(note.body);

    let { date, description, path, ...meta } = data;

    return {
      content,
      createdAt: new Date(date ?? note.created_at).toISOString(),
      description: description ?? note.headline,
      path: (path as string | undefined) ?? note.path,
      ...(meta as { tags?: string | string[] }),
    };
  });

  console.info("Starting to push to GitHub");

  try {
    await deleteRepository(GITHUB_CONTENT_REPO);
    console.info("Deleting the old repository");
  } catch (e) {
    console.info("Repo didn't exists");
  }

  await createRepository(GITHUB_CONTENT_REPO, "The content of sergiodxa.com");

  console.info("New repository created");

  for (let { content, path, ...note } of noteList) {
    if ("tags" in note && typeof note.tags === "string") {
      note.tags = note.tags.split(", ");
    }
    let markdown = matter.stringify(content.trim(), note);

    await pushFileToRepository(
      GITHUB_CONTENT_REPO,
      `articles/${path}.md`,
      "Upload from Collected Notes",
      Buffer.from(markdown)
    );
    process.stdout.write(".");
  }

  console.info("\nData pushed to GitHub");
}

async function main() {
  await migrateArticles();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
