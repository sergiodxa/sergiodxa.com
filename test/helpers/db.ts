import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { execa } from "execa";

declare const helperDb: unique symbol;
export type DATABASE_URL = string & { [helperDb]: true };

const DATABASE_URL_FORMAT = "file:./test/{{uuid}}.db";

export function generateDatabaseUrl() {
	let uuid = faker.datatype.uuid();
	return DATABASE_URL_FORMAT.replace("{{uuid}}", uuid) as DATABASE_URL;
}

export function migrateDatabase(url: string) {
	return execa("npx", ["prisma", "migrate", "deploy"], {
		env: { NODE_ENV: "test", DATABASE_URL: url },
	});
}

export function seedDatabase(url: string) {
	return execa("npx", ["prisma", "db", "seed"], {
		env: { NODE_ENV: "test", DATABASE_URL: url },
	});
}

export async function prepareDatabase() {
	let url = generateDatabaseUrl();
	await migrateDatabase(url);
	await seedDatabase(url);
	return url;
}

export async function createDatabaseClient() {
	let url = await prepareDatabase();
	return new PrismaClient({ datasources: { db: { url } } });
}
