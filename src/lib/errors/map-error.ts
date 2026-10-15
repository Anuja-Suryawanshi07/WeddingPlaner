import "server-only";
import { AppError } from "./app-error";
import { ERROR_DEFINITIONS, safeValidationDetails, type ErrorCode, type ValidationDetails } from "./error-codes";
import { safeRequestId } from "../api/request-context";

export type ApiError = { code: ErrorCode; message: string; details?: ValidationDetails; requestId?: string };

export function mapError(error: unknown, requestId?: string): { status: number; error: ApiError } {
  const recognized = error instanceof AppError && Object.hasOwn(ERROR_DEFINITIONS, error.code);
  const code = recognized ? error.code : "INTERNAL_ERROR";
  const definition = ERROR_DEFINITIONS[code];
  const body: ApiError = { code, message: definition.message };
  if (recognized && code === "VALIDATION_ERROR") {
    const details = safeValidationDetails(error.details);
    if (details) body.details = details;
  }
  if (requestId !== undefined) body.requestId = safeRequestId(requestId);
  return { status: definition.status, error: body };
}
