import { HttpError } from "./httpError.js";

type BodyValue = unknown;

export function readRequiredString(body: Record<string, BodyValue>, field: string) {
  const value = body[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `"${field}" is required`);
  }

  return value.trim();
}

export function readRouteParam(value: string | string[] | undefined, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `"${field}" route parameter is required`);
  }

  return value.trim();
}

export function readOptionalString(body: Record<string, BodyValue>, field: string) {
  const value = body[field];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError(400, `"${field}" must be a string`);
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

export function readBody(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "Request body must be an object");
  }

  return value as Record<string, BodyValue>;
}
