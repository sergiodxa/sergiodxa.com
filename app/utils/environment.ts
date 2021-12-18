class MissingEnvironmentError extends Error {
  constructor(env: string) {
    super(`Missing environment variable: "${env}"`);
  }
}

/**
 * Check if the current environment is `production`
 * @returns {boolean} True if the current environment is `production`
 */
export function isProduction(): boolean {
  return env("NODE_ENV") === "production";
}

/**
 * Check if the current environment is `development`
 * @returns {boolean} True if the current environment is `development`
 */
export function isDevelopment(): boolean {
  return env("NODE_ENV") === "development";
}

/**
 * Check if the current environment is `test`
 * @returns {boolean} True if the current environment is `test`
 */
export function isTest(): boolean {
  return env("NODE_ENV") === "test";
}

/**
 * Check if the current runtime of the code is server or browser.
 * @param {"server" | "browser"} name - The name of the runtime to check for.
 * @returns {boolean} - True if the current runtime is the expected.
 */
export function runtime(name: "server" | "browser"): boolean {
  switch (name) {
    case "browser": {
      return typeof window === "object" && typeof document === "object";
    }
    case "server": {
      return typeof process !== "undefined" && Boolean(process.versions?.node);
    }
  }
}

/**
 * Get the value from an environment variable and throw a
 * MissingEnvironmentError exception if it is not found, optinally you can pass
 * a fallback value to avoid throwing if the environment variable is not defined
 * @param {string} env The environment variable name.
 * @param {string} [fallback] The fallback value in case it's not defined.
 * @throws {MissingEnvironmentError} If the environment variable is not found.
 * @returns {string} The value of the environment variable.
 */
export function env(name: string, fallback?: string): string {
  let value = process.env[name] ?? fallback;
  if (!value) throw new MissingEnvironmentError(name);
  return value;
}
