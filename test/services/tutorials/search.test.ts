import { randomUUID } from "crypto";

import { describe, test, expect, vitest, beforeEach } from "vitest";

import { TutorialSchema } from "~/entities/data";
import { Tutorials } from "~/services/tutorials";

let tutorials = vitest.fn();

let repos = { data: { tutorials } } as unknown as SDX.Repos;

describe(Tutorials.SearchTutorials.name, () => {
	describe("Empty results", () => {
		test("should return all tutorials when the query is empty", async () => {
			let service = new Tutorials.SearchTutorials(repos);

			tutorials.mockResolvedValueOnce([
				{ type: "tutorial", id: randomUUID() },
				{ type: "tutorial", id: randomUUID() },
				{ type: "tutorial", id: randomUUID() },
			]);

			await expect(
				service.perform("").then((result) => result.list)
			).resolves.toHaveLength(3);
		});

		test("should return all tutorials when the query is a space", async () => {
			let service = new Tutorials.SearchTutorials(repos);

			tutorials.mockResolvedValueOnce([
				{ type: "tutorial", id: randomUUID() },
				{ type: "tutorial", id: randomUUID() },
				{ type: "tutorial", id: randomUUID() },
			]);

			await expect(
				service.perform(" ").then((result) => result.list)
			).resolves.toHaveLength(3);
		});

		test("should return all tutorials when the query is a tab", async () => {
			let service = new Tutorials.SearchTutorials(repos);

			tutorials.mockResolvedValueOnce([
				{ type: "tutorial", id: randomUUID() },
				{ type: "tutorial", id: randomUUID() },
				{ type: "tutorial", id: randomUUID() },
			]);

			await expect(
				service.perform("\t").then((result) => result.list)
			).resolves.toHaveLength(3);
		});
	});

	describe("Results by copy", () => {
		test("Find in the title", async () => {
			let service = new Tutorials.SearchTutorials(repos);

			let results = [
				{
					type: "tutorial",
					id: randomUUID(),
					title: "Hello World",
					content: "Lorem ipsum",
					technologies: [],
				},
				{
					type: "tutorial",
					id: randomUUID(),
					title: "Bye World",
					content: "Lorem ipsum",
					technologies: [],
				},
			];

			tutorials.mockResolvedValueOnce(results);
			await expect(
				service.perform("Hello").then((result) => result.list)
			).resolves.toHaveLength(1);

			tutorials.mockResolvedValueOnce(results);
			await expect(
				service.perform("Hello").then((result) => result.list)
			).resolves.toEqual([results[0]]);
		});

		test("Find by content", async () => {
			let service = new Tutorials.SearchTutorials(repos);

			let results = [
				{
					type: "tutorial",
					id: randomUUID(),
					title: "Lorem ipsum",
					content: "Hello world",
					technologies: [],
				},
				{
					type: "tutorial",
					id: randomUUID(),
					title: "Bye World",
					content: "Lorem ipsum",
					technologies: [],
				},
			];

			tutorials.mockResolvedValueOnce(results);
			await expect(
				service.perform("Hello").then((result) => result.list)
			).resolves.toHaveLength(1);

			tutorials.mockResolvedValueOnce(results);
			await expect(
				service.perform("Hello").then((result) => result.list)
			).resolves.toEqual([results[0]]);
		});

		describe("Find by technologies", () => {
			let service = new Tutorials.SearchTutorials(repos);

			beforeEach(() => {
				tutorials.mockResolvedValueOnce(
					TutorialSchema.array().parse([
						{
							id: randomUUID(),
							type: "tutorial",
							slug: "lorem-ipsum",
							title: "Lorem ipsum",
							content: "Hello world",
							technologies: [
								{ name: "@remix-run/react", version: "1.1.0" },
								{ name: "@remix-run/node", version: "1.1.1" },
								{ name: "@react", version: "17.3.0" },
								{ name: "@types/react-dom", version: "17.0.0" },
							],
							questions: [],
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						},
						{
							id: randomUUID(),
							type: "tutorial",
							slug: "bye-world",
							title: "Bye World",
							content: "Lorem ipsum",
							technologies: [
								{ name: "@remix-run/react", version: "1.10.0" },
								{ name: "@remix-run/node", version: "1.1.1" },
								{ name: "react", version: "18.0.0" },
								{ name: "@types/react-dom", version: "18.4.0" },
							],
							questions: [],
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						},
					])
				);
			});

			test("One tech without version", async () => {
				await expect(
					service.perform("tech:react").then((result) => result.list)
				).resolves.toHaveLength(1);
			});

			test("Multiple techs without version", async () => {
				await expect(
					service
						.perform("tech:react tech:@remix-run/react")
						.then((result) => result.list)
				).resolves.toHaveLength(1);
			});

			test("One tech with version", async () => {
				await expect(
					service
						.perform("tech:@remix-run/react@1.9.0")
						.then((result) => result.list)
				).resolves.toHaveLength(1);
			});

			test("Multiple techs with version", async () => {
				await expect(
					service
						.perform(
							"tech:@remix-run/react@1.10.0 tech:@types/react-dom@18.3.0"
						)
						.then((result) => result.list)
				).resolves.toHaveLength(1);
			});

			test("Multiple techs with version and without", async () => {
				await expect(
					service
						.perform("tech:@types/react-dom@18.4.0 tech:@remix-run/react")
						.then((result) => result.list)
				).resolves.toHaveLength(1);
			});

			test("Complex query with techs with versions and without and body", async () => {
				await expect(
					service
						.perform(
							"world bye tech:@types/react-dom@18.4.0 tech:@remix-run/react"
						)
						.then((result) => result.list)
				).resolves.toHaveLength(1);
			});

			test("No matches", async () => {
				await expect(
					service.perform("tech:@remix-run/dev").then((result) => result.list)
				).resolves.toHaveLength(0);
			});
		});

		test("Pagination", async () => {
			let service = new Tutorials.SearchTutorials(repos);

			let results = [
				{
					type: "tutorial",
					id: randomUUID(),
					title: "Lorem ipsum",
					content: "Hello world",
					technologies: [],
				},
				{
					type: "tutorial",
					id: randomUUID(),
					title: "Bye World",
					content: "Lorem ipsum",
					technologies: [],
				},
			];

			tutorials.mockResolvedValueOnce(results);

			await expect(
				service.perform("World", 1, 1).then((result) => result.list)
			).resolves.toHaveLength(1);
		});
	});
});
