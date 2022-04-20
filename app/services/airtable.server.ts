import type { FieldSet } from "airtable";
import Airtable from "airtable";
import { env } from "~/utils/environment";

export type Bookmark = FieldSet & {
  title: string;
  url: string;
  createdAt: string;
};

export async function getBookmarks(limit = 100): Promise<Bookmark[]> {
  let base = new Airtable({
    apiKey: env("AIRTABLE_API_KEY"),
  }).base(env("AIRTABLE_BASE"));

  let table = base<Bookmark>("links");

  let records = await table
    .select({
      maxRecords: limit,
      sort: [{ field: "created_at", direction: "desc" }],
    })
    .firstPage();

  return records.map((record) => ({
    title: record.fields.title,
    url: record.fields.url,
    createdAt: new Date(record._rawJson.createdTime).toJSON(),
  }));
}
