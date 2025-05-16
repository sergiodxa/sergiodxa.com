import { data } from "react-router";

const StatusCode = {
	Ok: 200 as const,
	BadRequest: 400 as const,
	NotFound: 404 as const,
	InternalServerError: 500 as const,
};

type ResponseInitWithoutStatus = Omit<ResponseInit, "status">;

export function ok<T>(value: T, init?: ResponseInitWithoutStatus) {
	return data(
		{ ...value, status: StatusCode.Ok },
		{ ...init, status: StatusCode.Ok },
	);
}

export function badRequest<T>(value: T, init?: ResponseInitWithoutStatus) {
	return data(
		{ ...value, status: StatusCode.BadRequest },
		{ ...init, status: StatusCode.BadRequest },
	);
}

export function notFound<T>(value: T, init?: ResponseInitWithoutStatus) {
	return data(
		{ ...value, status: StatusCode.NotFound },
		{ ...init, status: StatusCode.NotFound },
	);
}

export function internalServerError<T>(
	value: T,
	init?: ResponseInitWithoutStatus,
) {
	return data(
		{ ...value, status: StatusCode.InternalServerError },
		{ ...init, status: StatusCode.InternalServerError },
	);
}
