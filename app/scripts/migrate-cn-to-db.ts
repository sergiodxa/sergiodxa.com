import { User } from "@prisma/client";
import "dotenv/config";
import matter from "gray-matter";
import { cn, site } from "~/services/cn.server";
import { db } from "~/services/db.server";

async function getAllNotes() {
  let notes = await Promise.all(
    Array.from({ length: 4 })
      .map((_, index) => index + 1)
      .map((page) => {
        return cn.latestNotes(site, page, "public_site");
      })
  );
  return notes.flat();
}

export async function main(user: User) {
  let notes = await getAllNotes();

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
      };
    }),
    skipDuplicates: true,
  });
}
