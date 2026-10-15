import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { AppError } from "./app-error";
import { ERROR_DEFINITIONS, type ErrorCode, type ValidationDetails } from "./error-codes";
import { mapError } from "./map-error";

describe("application error mapping", () => {
  const statuses: Record<ErrorCode, number> = {
    VALIDATION_ERROR: 400, UNAUTHENTICATED: 401, FORBIDDEN: 403, NOT_FOUND: 404,
    CONFLICT: 409, INVALID_TOKEN: 400, TOKEN_EXPIRED: 400, RATE_LIMITED: 429,
    UPLOAD_ERROR: 400, EXTERNAL_SERVICE_ERROR: 502, INTERNAL_ERROR: 500,
    EMAIL_ALREADY_EXISTS: 409, INVITATION_ALREADY_ACCEPTED: 409,
    INVITATION_EMAIL_MISMATCH: 403, LAST_OWNER: 409, ALREADY_MEMBER: 409,
    ALBUM_NOT_EMPTY: 409, EXPENSE_HAS_ACTIVE_PAYMENTS: 409,
    PAYMENT_EXCEEDS_OUTSTANDING: 409, IDEMPOTENCY_KEY_REUSED: 409,
    PHOTO_NOT_PENDING: 409, PHOTO_ALREADY_MODERATED: 409,
    GALLERY_DISABLED: 403, GUEST_UPLOADS_DISABLED: 403,
  };
  it("covers the complete public code catalog with appropriate statuses", () => {
    expect(Object.keys(statuses).sort()).toEqual(Object.keys(ERROR_DEFINITIONS).sort());
    for (const [code, status] of Object.entries(statuses)) {
      const error = new AppError(code as ErrorCode);
      expect(error).toBeInstanceOf(Error);
      expect(mapError(error)).toEqual({
        status, error: { code, message: ERROR_DEFINITIONS[code as ErrorCode].message },
      });
    }
  });
  it.each([new Error("mongodb://private:secret@internal/db"), null, "secret", {
    name: "MongoServerError", code: 11000, message: "secret", keyValue: { email: "private" },
  }, { code: "FORBIDDEN", message: "forged" }])("sanitizes unrecognized thrown values: %#", (value) => {
    expect(mapError(value)).toEqual({
      status: 500, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    });
  });
  it("does not expose modified messages, stacks or causes of recognized errors", () => {
    const error = new AppError("NOT_FOUND");
    error.message = "private database name";
    error.stack = "private stack";
    error.cause = new Error("private password");
    expect(mapError(error)).toEqual({ status: 404, error: { code: "NOT_FOUND", message: "Resource not found" } });
  });
  it("preserves only structured, safe validation details", () => {
    const details = JSON.parse('{"email":"Invalid format","password":"secret value","__proto__":"Invalid value","constructor":"Invalid value","bad/path":"Invalid value"}') as ValidationDetails;
    const error = new AppError("VALIDATION_ERROR", details);
    expect(mapError(error).error.details).toEqual({ email: "Invalid format" });
    expect(Object.isFrozen(error.details)).toBe(true);
    expect(mapError(new AppError("FORBIDDEN", { email: "Invalid format" })).error).not.toHaveProperty("details");
  });
  it("bounds validation details and omits empty details", () => {
    const details = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`field${i}`, "Invalid value"])) as ValidationDetails;
    expect(Object.keys(new AppError("VALIDATION_ERROR", details).details!)).toHaveLength(50);
    expect(mapError(new AppError("VALIDATION_ERROR", {})).error).not.toHaveProperty("details");
  });
});
