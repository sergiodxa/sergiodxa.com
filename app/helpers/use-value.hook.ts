import {
	createContext,
	useContext,
	useMemo,
	useSyncExternalStore,
} from "react";

class Value<Type> extends EventTarget {
	#value: Type;

	constructor(initialValue: Type) {
		super();
		this.#value = initialValue;
	}

	get() {
		return this.#value;
	}

	set(value: Type) {
		this.#value = value;
		this.dispatchEvent(new CustomEvent("change"));
	}

	subscribe(callback: () => void) {
		this.addEventListener("change", callback);
		return () => this.removeEventListener("change", callback);
	}
}

const context = createContext(new Map<symbol, Value<unknown>>());

export function useValue<Type>(key: symbol, initialValue: Type) {
	let values = useContext(context);

	let instance = useMemo(() => {
		let instance = values.get(key) as Value<Type> | undefined;
		if (instance) return instance;
		instance = new Value(initialValue);
		values.set(key, instance);
		return instance;
	}, [initialValue, key, values]);

	let current = useSyncExternalStore(
		(callback) => instance.subscribe(callback),
		() => instance.get(),
		() => initialValue,
	);

	return [current, instance.set.bind(instance)] as const;
}
