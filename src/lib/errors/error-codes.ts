export const ERROR_DEFINITIONS = Object.freeze({
  VALIDATION_ERROR: { status: 400, message: "Invalid request data" },
  UNAUTHENTICATED: { status: 401, message: "Authentication required" },
  FORBIDDEN: { status: 403, message: "Access denied" },
  NOT_FOUND: { status: 404, message: "Resource not found" },
  CONFLICT: { status: 409, message: "The request conflicts with the current state" },
  INVALID_TOKEN: { status: 400, message: "Invalid access link" },
  TOKEN_EXPIRED: { status: 400, message: "Access link expired" },
  RATE_LIMITED: { status: 429, message: "Too many requests" },
  UPLOAD_ERROR: { status: 400, message: "Upload could not be completed" },
  EXTERNAL_SERVICE_ERROR: { status: 502, message: "External service unavailable" },
  INTERNAL_ERROR: { status: 500, message: "An unexpected error occurred" },
  EMAIL_ALREADY_EXISTS: { status: 409, message: "Email already registered" },
  INVITATION_ALREADY_ACCEPTED: { status: 409, message: "Invitation already accepted" },
  INVITATION_EMAIL_MISMATCH: { status: 403, message: "Invitation does not match this account" },
  LAST_OWNER: { status: 409, message: "The wedding must retain its owner" },
  ALREADY_MEMBER: { status: 409, message: "Already a wedding member" },
  ALBUM_NOT_EMPTY: { status: 409, message: "Album is not empty" },
  EXPENSE_HAS_ACTIVE_PAYMENTS: { status: 409, message: "Expense has active payments" },
  PAYMENT_EXCEEDS_OUTSTANDING: { status: 409, message: "Payment exceeds the outstanding amount" },
  IDEMPOTENCY_KEY_REUSED: { status: 409, message: "Idempotency key already used for another request" },
  PHOTO_NOT_PENDING: { status: 409, message: "Photo is no longer pending" },
  PHOTO_ALREADY_MODERATED: { status: 409, message: "Photo already moderated" },
  GALLERY_DISABLED: { status: 403, message: "Gallery is unavailable" },
  GUEST_UPLOADS_DISABLED: { status: 403, message: "Guest uploads are unavailable" },
} as const);

export type ErrorCode = keyof typeof ERROR_DEFINITIONS;
export const VALIDATION_MESSAGES = [
  "Invalid value", "Invalid type", "Invalid format", "Value too small", "Value too large",
] as const;
export type ValidationMessage = typeof VALIDATION_MESSAGES[number];
export type ValidationDetails = Readonly<Record<string, ValidationMessage>>;

// Only server-declared public field names and fixed messages belong here.
export function safeValidationDetails(details?: ValidationDetails): ValidationDetails | undefined {
  if (!details) return undefined;
  const entries = Object.entries(details).filter(([field, message]) =>
    field.length <= 128 && /^(?:_form|[A-Za-z]\w*(?:\.(?:[A-Za-z]\w*|\d+))*)$/.test(field) &&
    !["__proto__", "constructor", "prototype"].includes(field) &&
    VALIDATION_MESSAGES.includes(message),
  ).slice(0, 50);
  return entries.length ? Object.freeze(Object.fromEntries(entries)) : undefined;
}
