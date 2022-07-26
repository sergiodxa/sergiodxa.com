export async function measure<Value>(
  name: string,
  headers: Headers,
  callback: () => Promise<Value>
) {
  let header = [encodeURIComponent(name)];

  let start = performance.now();

  let result = await callback();

  let end = performance.now();

  header.push(`dur=${end - start}`);

  headers.append("Server-Timing", header.join(";"));

  return result;
}
