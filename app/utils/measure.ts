export async function measure<Result>(
	key: string,
	callback: () => Result | Promise<Result>,
) {
	let start = Date.now();

	try {
		let result = callback();
		if (result instanceof Promise) result = await result;
		return result;
	} finally {
		let end = Date.now();
	}
}
