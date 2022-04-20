/**
 * Check if an array has any element inside
 */
export function hasAny<Value>(list: Value[]): boolean {
  return list.length > 0;
}

/**
 * Check if an array is empty
 */
export function isEmpty<Value>(list: Value[]): boolean {
  return !hasAny(list);
}

/**
 * Get the first n items of an array, defaults to one item
 */
export function first<Value>(list: Value[], limit = 1): Value[] {
  return list.slice(0, limit);
}

/**
 * Get the last n items of an array default to one item
 */
export function last<Value>(list: Value[], limit = 1): Value[] {
  return first([...list].reverse(), limit).reverse();
}

/**
 * Remove duplicated values from an array (only primitives and references)
 */
export function unique<Value>(array: Value[]): Value[] {
  return Array.from(new Set(array));
}

/**
 * Wrap a value in an array if it's not already an array
 */
export function toArray<Value = unknown>(value: Value | Value[]): Value[] {
  if (Array.isArray(value)) return value;
  return [value];
}

/**
 * Skip the first n items of an array
 * @example
 * first([1, 2, 3, 4, 5], 2) // [3, 4, 5]
 */
export function skip<Value>(list: Value[], limit: number): Value[] {
  return list.slice(limit);
}
