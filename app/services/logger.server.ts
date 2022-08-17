import { createLogger, format, transports } from "winston";

export const logger = createLogger();

if (process.env.NODE_ENV === "production") {
	logger.add(new transports.Console({ format: format.json() }));
} else if (process.env.NODE_ENV === "test") {
	logger.add(new transports.Console({ format: format.errors() }));
} else {
	logger.add(new transports.Console({ format: format.simple() }));
}
