import type { AppLoadContext } from "@remix-run/cloudflare";

import "pptr-testing-library/extend";
import { expect, test } from "vitest";

import { envSchema } from "~/env";
import { AirtableMockService } from "~/helpers/airtable";
import { CollectedNotesMockService } from "~/helpers/cn";
import { GitHubMockService } from "~/helpers/gh";
import { loader } from "~/routes/articles";
import { localeCookie } from "~/services/i18n.server";

test("Articles - loader", async () => {
	let airtable = new AirtableMockService();
	let cn = new CollectedNotesMockService();
	let gh = new GitHubMockService();
	let env = envSchema.parse(process.env);

	cn.getNotes.mockResolvedValueOnce([
		{ id: 1, path: "slug-1", title: "Title 1" },
	]);

	let response = await loader({
		request: new Request("http://sergiodxa.dev/articles?page=2&q=hello", {
			headers: { cookie: await localeCookie.serialize("cimode") },
		}),
		params: {},
		context: { env, services: { cn, airtable, gh } } as AppLoadContext,
	});

	let data = await response.json();

	expect(data).toEqual({
		term: "hello",
		page: 2,
		notes: [{ id: 1, path: "slug-1", title: "Title 1" }],
		meta: { title: "articles.meta.title.search" },
	});
});
