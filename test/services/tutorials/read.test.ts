import { randomUUID } from "crypto";

import { describe, vitest } from "vitest";

import { TutorialSchema } from "~/entities/data";
import { Tutorials } from "~/services/tutorials";

let findTutorialBySlug = vitest.fn();
let tutorials = vitest.fn();

let repos = { data: { tutorials, findTutorialBySlug } } as unknown as SDX.Repos;

let tutorialList = TutorialSchema.array().parse([
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
	{
		id: randomUUID(),
		type: "tutorial",
		slug: "test-remix-applications",
		title: "Test Remix applications",
		content: "This is how you test a Remix application...",
		technologies: [{ name: "@remix-run/react", version: "1.0.0" }],
		questions: [],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
]);

describe(Tutorials.ReadTutorial.name, () => {
	test("returns null if tutorial does not exist", async () => {
		let service = new Tutorials.ReadTutorial(repos);

		findTutorialBySlug.mockResolvedValueOnce(null);

		let result = await service.perform("does-not-exist");

		expect(result).toBe(null);
	});

	test("returns the tutorial if it exists", async () => {
		let service = new Tutorials.ReadTutorial(repos);

		tutorials.mockResolvedValueOnce(tutorialList);
		findTutorialBySlug.mockResolvedValueOnce(tutorialList.at(0));

		let result = await service.perform("lorem-ipsum");

		expect(result).toEqual({
			tutorial: tutorialList.at(0),
			related: tutorialList.slice(1, 2),
		});
	});
});
