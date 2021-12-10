import { useId } from "@react-aria/utils";
import clsx from "clsx";
import {
  createContext,
  FocusEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
  useContext,
} from "react";

let fieldLabelIdContext = createContext<string | undefined>(void 0);
let fieldHintIdContext = createContext<string | undefined>(void 0);

type ValidateEvent = { value: string };
type ValidateResult = string;
/**
 * Validate if an input is valid.
 * @returns {string} The error message if the input is invalid, otherwise an empty string
 */
type ValidateEventHandler = (event: ValidateEvent) => ValidateResult;

export function Field({ children }: { children: ReactNode }) {
  let id = useId();
  let hintId = useId();
  return (
    <fieldLabelIdContext.Provider value={id}>
      <fieldHintIdContext.Provider value={hintId}>
        <div className="space-y-1">{children}</div>
      </fieldHintIdContext.Provider>
    </fieldLabelIdContext.Provider>
  );
}

Field.Label = Label;
Field.Hint = Hint;
Field.Input = Input;
Field.Textarea = Textarea;

function Label({ children }: { children: ReactNode }) {
  let id = useContext(fieldLabelIdContext);
  return (
    <label className="block text-sm font-medium text-gray-700" htmlFor={id}>
      {children}
    </label>
  );
}

function Hint({ children }: { children: ReactNode }) {
  let id = useContext(fieldHintIdContext);
  return (
    <p id={id} className="text-sm text-gray-500">
      {children}
    </p>
  );
}

function Input({
  onValidate,
  ...props
}: Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "id" | "aria-describedby" | "onBlur"
> & { onValidate?: ValidateEventHandler }) {
  let id = useContext(fieldLabelIdContext);
  let hintId = useContext(fieldHintIdContext);

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    let $input = event.currentTarget;
    if (!onValidate) return;
    $input.setCustomValidity(onValidate({ value: $input.value }));
    $input.reportValidity();
  }

  return (
    <input
      id={id}
      className={clsx(
        "shadow-sm block w-full sm:text-sm border-gray-300 rounded-md",
        "focus:outline-nonefocus:ring-indigo-500 focus:border-indigo-500",
        "invalid:border-green-300 invalid:text-green-900 invalid:placeholder-green-300",
        "focus:invalid:ring-green-500 focus:invalid:border-green-500",
        "invalid:border-red-300 invalid:text-red-900 invalid:placeholder-red-300",
        "focus:invalid:ring-red-500 focus:invalid:border-red-500"
      )}
      aria-describedby={hintId}
      onBlur={handleBlur}
      {...props}
    />
  );
}

function Textarea({
  onValidate,
  ...props
}: Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className" | "id" | "aria-describedby" | "onBlur"
> & { onValidate?: ValidateEventHandler }) {
  let id = useContext(fieldLabelIdContext);
  let hintId = useContext(fieldHintIdContext);

  function handleBlur(event: FocusEvent<HTMLTextAreaElement>) {
    let $input = event.currentTarget;
    if (!onValidate) return;
    $input.setCustomValidity(onValidate({ value: $input.value }));
    $input.reportValidity();
  }

  return (
    <textarea
      id={id}
      className={clsx(
        "shadow-sm block w-full sm:text-sm border-gray-300 rounded-md",
        "focus:outline-nonefocus:ring-indigo-500 focus:border-indigo-500",
        "invalid:border-green-300 invalid:text-green-900 invalid:placeholder-green-300",
        "focus:invalid:ring-green-500 focus:invalid:border-green-500",
        "invalid:border-red-300 invalid:text-red-900 invalid:placeholder-red-300",
        "focus:invalid:ring-red-500 focus:invalid:border-red-500"
      )}
      aria-describedby={hintId}
      onBlur={handleBlur}
      {...props}
    />
  );
}
