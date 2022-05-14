import { z, type ZodSchema } from "zod";

export type Success<Value> = { status: "success"; value: Value };
export type Failure = { status: "failure"; error: Error };

export type Result<Value> = Success<Value> | Failure;

export type UseCase<Input, Output> = {
  schema(schema: typeof z): ZodSchema<Input>;
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
  let schema = useCase.schema(z);

  async function perform(
    context: SDX.Context,
    formData = new FormData()
  ): Promise<Result<Output>> {
    try {
      let input = schema.parse(transform(formData));
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

function transform(formData: FormData): Record<string, unknown> {
  let result: Record<string, unknown> = {};
  for (let [key, value] of formData.entries()) {
    if (value === null) {
      result[key] = null;
    } else if (value instanceof File) {
      result[key] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
}
