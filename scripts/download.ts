import { type Note, type NoteVisibility } from "collected-notes";
import matter from "gray-matter";
import cn, { CN_SITE } from "./helpers/cn";
import "./helpers/fetch";
import gh, { GITHUB_CONTENT_REPO, GITHUB_USERNAME } from "./helpers/gh";

const VISIBILITY: NoteVisibility = "public_site";

async function main() {
  let notes: Note[] = [];
  let page = 1;
  let loadMore = true;

  while (loadMore) {
    console.info("Fetching page %d", page);
    let moreNotes = await cn.latestNotes(CN_SITE, page, VISIBILITY);
    console.info("Fetched %d notes", moreNotes.length);
    notes.push(...moreNotes);
    if (moreNotes.length === 40) {
      page += 1;
      continue;
    } else loadMore = false;
  }

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
    await gh.request("DELETE /repos/{owner}/{repo}", {
      owner: GITHUB_USERNAME,
      repo: GITHUB_CONTENT_REPO,
    });
    console.info("Deleting the old repository");
  } catch (e) {
    console.info("Repo didn't exists");
  }

  await gh.request("POST /user/repos", {
    name: GITHUB_CONTENT_REPO,
    private: true,
    has_issues: false,
    has_projects: false,
    has_wiki: false,
    description: "The content of sergiodxa.com",
    allow_auto_merge: true,
    allow_merge_commit: false,
    allow_rebase_merge: false,
  });

  console.info("New repository created");

  for (let { content, path, ...note } of noteList) {
    if ("tags" in note && typeof note.tags === "string") {
      note.tags = note.tags.split(", ");
    }
    let markdown = matter.stringify(content.trim(), note);

    await gh.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: GITHUB_USERNAME,
      repo: GITHUB_CONTENT_REPO,
      path: `${path}.md`,
      message: "Upload from Collected Notes",
      committer: {
        name: "Sergio Xalambrí",
        email: "hello@sergiodxa.com",
      },
      content: Buffer.from(markdown).toString("base64"),
    });
    process.stdout.write(".");
  }

  console.info("\nData pushed to GitHub");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
