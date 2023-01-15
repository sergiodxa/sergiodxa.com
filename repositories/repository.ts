import type { z } from "zod";

export abstract class Repository<Schema extends z.ZodSchema> {
	protected abstract schema: Schema;
}

export abstract class DatabaseRepositroy<
	Schema extends z.ZodSchema,
	Entity extends z.infer<Schema> = z.infer<Schema>
> extends Repository<Schema> {
	protected abstract tableName: string;

	constructor(protected db: D1Database) {
		super();
	}

	protected async findAll(): Promise<Entity[]> {
		let result = await this.db
			.prepare(`SELECT * FROM ?`)
			.bind(this.tableName)
			.run<Entity>();
		if (result.error) throw new Error(result.error);
		if (!result.results) return [];
		return this.schema.array().parse(result.results);
	}

	protected async findBy(column: keyof Entity, value: Entity[keyof Entity]) {
		let result = await this.db
			.prepare(`SELECT * FROM ? WHERE ? = ?`)
			.bind(this.tableName, column, value)
			.run<Entity>();
		if (result.error) throw new Error(result.error);
		if (!result.results) return [];
		return this.schema.array().parse(result.results);
	}
}
