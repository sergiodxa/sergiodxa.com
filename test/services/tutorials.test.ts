import { describe, test, vi } from "vitest";

import { TutorialsService } from "~/services/tutorials";

let repos = {
	tutorials: {
		list: vi.fn(),
	},
};

describe(TutorialsService.name, () => {
	let service = new TutorialsService(repos as unknown as SDX.Repos);

	describe(service.list.name, () => {
		test("should return a list of tutorials", async () => {
			repos.tutorials.list.mockResolvedValueOnce([
				{ name: "foo" },
				{ name: "bar" },
			]);

			await expect(service.list()).resolves.toMatchInlineSnapshot(`
				{
				  "items": [
				    {
				      "name": "foo",
				    },
				    {
				      "name": "bar",
				    },
				  ],
				  "page": {
				    "current": 1,
				    "first": 1,
				    "last": 1,
				    "next": null,
				    "prev": null,
				    "size": 1000,
				  },
				  "total": 2,
				}
			`);
		});
	});
});
