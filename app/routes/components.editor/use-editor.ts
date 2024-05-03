import type { Dispatch, RefObject } from "react";
import type { SelectionType } from "./get-selection";

import {
	createContext,
	createRef,
	useCallback,
	useContext,
	useReducer,
} from "react";

import { getSelected } from "./get-selected";
import { setSelectionRange } from "./set-selection-range";
import { updateContent } from "./update-content";

export type EditorState = {
	value: string;
};

export type Updater = (selected: string) => string;
export type Handler = (selection: SelectionType) => SelectionType;

export type Actions =
	| { type: "write"; payload: { value: string } }
	| {
			type: "update";
			payload: { selection: SelectionType; updater: Updater; handler: Handler };
	  };

const initialState: EditorState = {
	value: "",
};

const context = createContext<{
	element: RefObject<HTMLTextAreaElement>;
	state: EditorState;
	dispatch: Dispatch<Actions>;
	// biome-ignore lint/suspicious/noEmptyBlockStatements: This is a fallback so it's ok
}>({ element: createRef(), state: initialState, dispatch() {} });

export function useEditor(
	element: HTMLTextAreaElement | null,
	defaultContent?: string,
) {
	return useReducer(
		(state: EditorState, action: Actions) => {
			if (action.type === "write") {
				if (action.payload.value === state.value) return state;
				return { ...state, value: action.payload.value };
			}

			if (action.type === "update" && element) {
				let selection = action.payload.selection;
				let selected = getSelected(state.value, selection);
				let updated = action.payload.updater(selected);
				setSelectionRange(element, action.payload.handler(selection));
				let value = updateContent(state.value, selection, updated);
				return { ...state, value };
			}

			return state;
		},
		defaultContent ? { value: defaultContent } : initialState,
	);
}

export const Provider = context.Provider;

export function useDispatch() {
	return useContext(context).dispatch;
}

export function useState() {
	return useContext(context).state;
}

export function useElement() {
	let { element } = useContext(context);
	if (!element) throw new Error("Element not found");
	return element;
}

export function useUpdate() {
	let dispatch = useDispatch();
	return useCallback(
		(payload: Extract<Actions, { type: "update" }>["payload"]) => {
			dispatch({ type: "update", payload });
		},
		[dispatch],
	);
}
