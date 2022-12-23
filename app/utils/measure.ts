export async function measure<Result>(
	key: string,
	callback: () => Result | Promise<Result>
) {
	let start = Date.now();
	let result = callback();
	if (result instanceof Promise) result = await result;
	let end = Date.now();
	console.log(`${key} took ${end - start}ms`);
	return result;
}
