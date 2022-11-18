import { PrismaClient } from "@prisma/client";

async function seed() {
	let client = new PrismaClient();
	let bookmarksCount = await client.bookmark.count();

	if (!bookmarksCount) {
		await client.bookmark.create({
			data: {
				title: "Prisma",
				url: "https://www.prisma.io/",
				createdAt: new Date().toISOString(),
			},
		});
		await client.bookmark.create({
			data: {
				title: "Prisma Docs",
				url: "https://www.prisma.io/docs/",
				createdAt: new Date().toISOString(),
			},
		});
		await client.bookmark.create({
			data: {
				title: "Prisma Blog",
				url: "https://www.prisma.io/blog/",
				createdAt: new Date().toISOString(),
			},
		});
	}
}

seed().then(
	() => {
		process.exit(0);
	},
	(reason) => {
		console.error(reason);
		process.exit(1);
	}
);
