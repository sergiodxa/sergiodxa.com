export type Success<Value> = { status: "success"; value: Value };
export type Failure = { status: "failure"; error: Error };

export type Result<Value> = Success<Value> | Failure;

export type UseCase<Input, Output> = {
  validate(input: URLSearchParams | FormData): Promise<Input>;
  perform(context: SDX.Context, input: Input): Promise<Output>;
};

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
    data: FormData | URLSearchParams = new FormData()
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

  return perform;
}
