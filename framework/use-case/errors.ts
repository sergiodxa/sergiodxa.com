/**
 * An error thrown when the validation check of a use case fails.
 */
export class ValidationError extends AggregateError {}

/**
 * An error thrown when the execution of a use case fails.
 */
export class BehaviorError extends AggregateError {}
