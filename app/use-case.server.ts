export interface Success<Value> {
  status: "success";
  value: Value;
}

export interface Failure {
  status: "failure";
  error: Error;
}

export type Data = FormData | URLSearchParams;

export interface ValidateFunction<ValidatedData> {
  (input: FormData | URLSearchParams): Promise<ValidatedData>;
}

export interface PerformFunction<Input, Output> {
  (context: SDX.Context, input: Input): Promise<Output>;
}

interface UseCase<Input, Output> {
  validate: ValidateFunction<Input>;
  perform: PerformFunction<Input, Output>;
}

export type Result<Value> = Success<Value> | Failure;

export type SuccessValue<T extends (...args: any) => Promise<unknown>> =
  Awaited<ReturnType<T>> extends Result<infer Value> ? Value : never;

export function createUseCase<Input, Output>(useCase: UseCase<Input, Output>) {
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

  perform.isSuccess = (result: Result<Output>): result is Success<Output> => {
    return result.status === "success";
  };

  perform.isFailure = (result: Result<Output>): result is Failure => {
    return result.status === "failure";
  };

  return perform;
}
