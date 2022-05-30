export interface Success<Value> {
  status: "success";
  value: Value;
}

export interface Failure {
  status: "failure";
  error: Error;
}

export type Data = FormData | URLSearchParams;

export interface GuardFunction {
  (context: SDX.Context): Promise<boolean>;
}

export interface ValidateFunction<ValidatedData> {
  (input: FormData | URLSearchParams): Promise<ValidatedData>;
}

export interface PerformFunction<Input, Output> {
  (context: SDX.Context, input: Input): Promise<Output>;
}

export interface UseCase<Input, Output> {
  validate: ValidateFunction<Input>;
  perform: PerformFunction<Input, Output>;
}

export type Result<Value> = Success<Value> | Failure;

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

interface Query<Context, Input = unknown, Output = unknown> {
  validate(searchParams: URLSearchParams): Promise<Input>;
  perform(context: Context, input: Input): Promise<Output>;
}

interface Command<Context, Input = unknown, Output = void> {
  validate(formData: FormData): Promise<Input>;
  perform(context: Context, input: Input): Promise<Output>;
}

export function createQuery<Input, Output>(
  query: Query<SDX.Context, Input, Output>
) {
  async function perform(
    context: SDX.Context,
    data = new URLSearchParams()
  ): Promise<Result<Output>> {
    try {
      let input = await query.validate(data);

      let output = await query.perform(context, input);

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

export function createCommand<Input, Output>(
  query: Command<SDX.Context, Input, Output>
) {
  async function perform(
    context: SDX.Context,
    data = new FormData()
  ): Promise<Result<Output>> {
    try {
      let input = await query.validate(data);

      let output = await query.perform(context, input);

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
