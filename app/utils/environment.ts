class MissingEnvironmentError extends Error {
  constructor(env: string) {
    super(`Missing environment variable: "${env}"`);
  }
}

/**
 * Check the environment the app is currently running
 */
export function env(
  environment: "production" | "test" | "development"
): boolean {
  return process.env.NODE_ENV === environment;
}

/**
 * Check if the current runtime of the code is server or browser
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
 */
export function requireEnv(name: string, fallback?: string): string {
  let value = process.env[name] ?? fallback;
  if (!value) throw new MissingEnvironmentError(name);
  return value;
}
