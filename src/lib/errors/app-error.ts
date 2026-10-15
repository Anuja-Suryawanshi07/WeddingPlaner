import { ERROR_DEFINITIONS, safeValidationDetails, type ErrorCode, type ValidationDetails } from "./error-codes";

// No caller-supplied public message: raw provider/database errors must never be echoed.
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details?: ValidationDetails;

  constructor(code: ErrorCode, details?: ValidationDetails) {
    super(ERROR_DEFINITIONS[code].message);
    this.name = "AppError";
    this.code = code;
    this.details = code === "VALIDATION_ERROR" ? safeValidationDetails(details) : undefined;
  }
}
