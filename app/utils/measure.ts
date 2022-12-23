export function measure<Result>(key: string, callback: () => Result) {
	let start = Date.now();
	let result = callback();
	let end = Date.now();
	console.log(`${key} took ${end - start}ms`);
	return result;
}
