import { BehaviorError, ValidationError } from "./errors";
import { type Result, type ResultSuccessValue } from "./result";

type ExecuteFunction<Input, Output, Context> = (args: {
  input: Input;
  context: Context;
}) => Promise<Output>;

type AsyncFunction = (...args: any) => Promise<Result<unknown>>;

type UseCase<Input, Output, Context> = {
  validate(input: Partial<Input>, context: Context): asserts input is Input;
  execute: ExecuteFunction<Input, Output, Context>;
};

export type SuccessValue<T extends AsyncFunction> = ResultSuccessValue<
  Awaited<ReturnType<T>>
>;

export type EmptyInput = Record<never, never>;

export function define<Input, Output, Context = SDX.Context>(
  useCase: UseCase<Input, Output, Context>
) {
  return async function run(
    input: Partial<Input>,
    context: Context
  ): Promise<Result<Output>> {
    try {
      useCase.validate(input, context);
    } catch (error) {
      if (error instanceof Error) {
        return { status: "failure", error: new ValidationError([error]) };
      }
      throw TypeError(`Unexpected error: ${error}`);
    }

    try {
      let output = await useCase.execute({ input, context });
      return { status: "success", value: output };
    } catch (error) {
      if (error instanceof Error) {
        return { status: "failure", error: new BehaviorError([error]) };
      }
      throw TypeError(`Unexpected error: ${error}`);
    }
  };
}
