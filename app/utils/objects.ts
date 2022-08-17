/**
 * Check if an object has a property
 */
export function hasOwn<This extends Record<string, unknown>>(
	object: This,
	property: keyof This
): boolean {
	return Object.prototype.hasOwnProperty.call(object, property);
}

/**
 * Given an input object, return a new object with only the selected
 * attributes. If the input is an array it will iterate it and call itself
 * with each element, then return a new array.
 */
export function pick<
	Input extends Record<string, unknown>,
	Picked extends keyof Input
>(object: Input, keys: Array<Picked>): Pick<Input, Picked>;
export function pick<
	Input extends Record<string, unknown>,
	Picked extends keyof Input
>(object: Input[], keys: Array<Picked>): Pick<Input, Picked>[];
export function pick<
	Input extends Record<string, unknown>,
	Picked extends keyof Input
>(
	object: Input | Input[],
	keys: Array<Picked>
): Pick<Input, Picked> | Pick<Input, Picked>[] {
	if (Array.isArray(object)) {
		return object.map((item) => pick(item, keys));
	}

	return Object.fromEntries(
		Object.entries(object).filter(([key]) =>
			keys.includes(key as unknown as Picked)
		)
	) as Pick<Input, Picked>;
}

/**
 * Given an input object, return a new object without the omitted keys.
 * If the input is an array it will iterate it and call itself with each
 * element, then return a new array.
 * @example
 * omit({a: 1, b: 2, c: 3}, ['a', 'c']) // {b: 2}
 * @example
 * omit([{a: 1, b: 2, c: 3}, {a: 1, b: 2, c: 3}], ['a', 'c']) // [{b: 2}]
 */
export function omit<
	Input extends Record<string, unknown>,
	Omitted extends keyof Input
>(object: Input, keys: Array<Omitted>): Omit<Input, Omitted>;
export function omit<
	Input extends Record<string, unknown>,
	Omitted extends keyof Input
>(object: Input[], keys: Array<Omitted>): Omit<Input, Omitted>[];
export function omit<
	Input extends Record<string, unknown>,
	Omitted extends keyof Input
>(
	object: Input | Input[],
	keys: Array<Omitted>
): Omit<Input, Omitted> | Omit<Input, Omitted>[] {
	if (Array.isArray(object)) {
		return object.map((item) => omit(item, keys));
	}

	return Object.fromEntries(
		Object.entries(object).filter(
			([key]) => !keys.includes(key as unknown as Omitted)
		)
	) as Omit<Input, Omitted>;
}
