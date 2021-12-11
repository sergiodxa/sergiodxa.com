import { PostVisibility } from ".prisma/client";
import { NoteVisibility } from "collected-notes";
import matter from "gray-matter";
import { LoaderFunction, redirect } from "remix";
import { adminAuthorizer } from "~/services/auth.server";
import { cn, site } from "~/services/cn.server";
import { db } from "~/services/db.server";

function getPostVisibility(visibility: NoteVisibility): PostVisibility {
  switch (visibility) {
    case "public":
    case "public_site":
      return PostVisibility.PUBLIC;
    case "public_unlisted":
    case "private":
      return PostVisibility.DRAFT;
    default:
      throw new Error(`Invalid visibility "${visibility}"`);
  }
}

export let loader: LoaderFunction = async (args) => {
  let user = await adminAuthorizer.authorize(args, {
    failureRedirect: "/",
    raise: "redirect",
  });

  let notes = (
    await Promise.all(
      Array.from({ length: 4 })
        .map((_, index) => index + 1)
        .map((page) => {
          return cn.latestNotes(site, page);
        })
    )
  ).flat();

  await db.post.deleteMany();

  await db.post.createMany({
    data: notes.map((note) => {
      let { content, data } = matter(note.body);
      let updatedAt = new Date(data.date ?? note.created_at);
      let canonicalUrl = data.canonical_url ?? "";
      let lang = data.lang ?? "en";
      let body = content.split("\n").slice(2).join("\n").trim();
      let headline = body.slice(0, body.indexOf("\n")).trim();

      return {
        slug: note.path,
        title: note.title,
        userId: user.id,
        body,
        lang,
        headline,
        updatedAt,
        canonicalUrl,
        visibility: getPostVisibility(note.visibility),
      };
    }),
    skipDuplicates: true,
  });

  return redirect("/articles");
};
