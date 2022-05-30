export interface Success<Value> {
  status: "success";
  value: Value;
}
export interface Failure {
  status: "failure";
  error: Error;
}

export type Data = URLSearchParams | FormData;

export interface ValidatorFunction<Output> {
  (input: Data): Promise<Output>;
}

export interface PerformFunction<Input, Output> {
  (context: SDX.Context, input: Input): Promise<Output>;
}

export interface UseCase<Input, Output> {
  validate: ValidatorFunction<Input>;
  perform: PerformFunction<Input, Output>;
}

export type Result<Value> = Success<Value> | Failure;

export function isSuccess<Value>(
  result: Result<Value>
): asserts result is Success<Value> {
  if (result.status === "failure") throw new Error("Result is a failure");
}

export function createUseCase<Input = unknown, Output = unknown>(
  useCase: UseCase<Input, Output>
) {
  async function perform(
    context: SDX.Context,
    data: Data = new FormData()
  ): Promise<Result<Output>> {
    try {
      let input = await useCase.validate(data);

      let output = await useCase.perform(context, input);

      return { status: "success", value: output };
    } catch (error) {
      if (error instanceof globalThis.Error) {
        return { status: "failure", error: error };
      }
      throw TypeError(`Unexpected error: ${error}`);
    }
  }

  perform.isSuccess = (result: Result<Output>): result is Success<Output> => {
    return result.status === "success";
  };

  perform.isFailure = (result: Result<Output>): result is Failure => {
    return result.status === "failure";
  };

  return perform;
}
