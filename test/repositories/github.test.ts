import { describe, expect } from "vitest";

import {
	GitHubFileNotFoundError,
	GithubRepository,
} from "~/repositories/github";

describe(GithubRepository.name, () => {
	let repo = new GithubRepository(process.env.GITHUB_TOKEN!);

	describe(repo.getMarkdownFile.name, () => {
		test("should throw if the file doesn't exists", async () => {
			await expect(repo.getMarkdownFile("not-found")).rejects.toThrowError(
				GitHubFileNotFoundError
			);
		});

		test("should return content if the file exists", async () => {
			await expect(repo.getMarkdownFile("tutorials/about.md")).resolves
				.toMatchInlineSnapshot(`
  {
    "file": {
      "attributes": {
        "createdAt": 2023-01-20T08:13:46.140Z,
        "id": "6f1ed236-7000-4fed-aecf-d91ba1aabbf3",
        "questions": [],
        "technologies": [],
        "title": "About",
        "updatedAt": 2023-01-20T08:13:46.140Z,
      },
      "body": "![A photo of me](https://photos.collectednotes.com/photos/55/ebdece0b-40ee-4452-ad24-6e96064c2695)

  Hi there! I'm a web developer currently based on Lima, PerÃº.

  I'm currently working in [Silverback Ventures](https://silverback.ventures) as the web developer for our product, before I worked at [Able](https://able.co), [Vercel](https://vercel.com), and [Platzi](https://platzi.com).

  I have also taught Web Development at Platzi and [Codeable](https://codeable.la), a full-stack development bootcamp created by Able to teach our development stack, React and Rails. At Codeable I created the initial curriculum for Frontend.
  ",
    },
    "path": "content/tutorials/about.md",
  }
`);
		});
	});
});
