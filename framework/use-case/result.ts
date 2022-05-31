export type Success<Value> = {
  status: "success";
  value: Value;
};

export type Failure = {
  status: "failure";
  error: Error;
};

export type Result<Value> = Success<Value> | Failure;

export type ResultSuccessValue<T extends Result<unknown>> = T extends Success<
  infer Value
>
  ? Value
  : never;

export function isSuccess<Output>(
  result: Result<Output>
): result is Success<Output> {
  return result.status === "success";
}

export function isFailure<Output>(result: Result<Output>): result is Failure {
  return result.status === "failure";
}
