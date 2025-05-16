import { useCallback, useState } from "react";

export function useToggle(initialState = false) {
	let [state, setState] = useState(initialState);
	let toggle = useCallback(() => setState((prev) => !prev), []);
	return [state, toggle] as const;
}
