import "server-only";
import { z } from "zod";
import { AppError } from "../errors/app-error";

export type PagePagination = { page: number; limit: number; skip: number };
export type CursorLimits = Readonly<{ defaultLimit: number; maxLimit: number }>;
export const PHOTO_CURSOR_LIMITS: CursorLimits = Object.freeze({ defaultLimit: 24, maxLimit: 48 });

function single(query: URLSearchParams, key: string): string | undefined {
  const values = query.getAll(key);
  if (values.length > 1) throw new AppError("VALIDATION_ERROR");
  return values[0];
}
function positiveInteger(raw: string | undefined, fallback: number, max: number): number {
  const schema = z.string().regex(/^[1-9]\d*$/).transform(Number)
    .pipe(z.number().int().positive().max(max));
  const result = schema.optional().transform((value) => value ?? fallback).safeParse(raw);
  if (!result.success) throw new AppError("VALIDATION_ERROR");
  return result.data;
}
export function parsePagePagination(query: URLSearchParams): PagePagination {
  const page = positiveInteger(single(query, "page"), 1, Number.MAX_SAFE_INTEGER);
  const limit = positiveInteger(single(query, "limit"), 20, 100);
  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) throw new AppError("VALIDATION_ERROR");
  return { page, limit, skip };
}
export function pageMetadata({ page, limit, skip }: PagePagination, total: number) {
  if (!Number.isSafeInteger(total) || total < 0 || !Number.isSafeInteger(page) || page < 1 ||
      !Number.isSafeInteger(limit) || limit < 1 || limit > 100 ||
      !Number.isSafeInteger(skip) || skip !== (page - 1) * limit) {
    throw new Error("Invalid server pagination metadata");
  }
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

// Decoded position only, NOT a frozen wire format. Never a MongoDB query object.
const cursorPositionSchema = z.strictObject({
  createdAt: z.date(),
  _id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
export type CursorPosition = z.infer<typeof cursorPositionSchema>;
export type CursorDecoder = (opaque: string) => unknown;

export function decodeCursor(raw: unknown, decode: CursorDecoder): CursorPosition {
  // Transport bound; encoding, signing and versioning await an architecture decision.
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2048 || /[\s\x00-\x1f\x7f]/.test(raw)) {
    throw new AppError("VALIDATION_ERROR");
  }
  try {
    const result = cursorPositionSchema.safeParse(decode(raw));
    if (!result.success) throw new Error("Invalid position");
    return result.data;
  } catch {
    throw new AppError("VALIDATION_ERROR");
  }
}

export function parseCursorPagination(query: URLSearchParams, decode: CursorDecoder, limits: CursorLimits) {
  if (!Number.isSafeInteger(limits.defaultLimit) || !Number.isSafeInteger(limits.maxLimit) ||
      limits.defaultLimit < 1 || limits.maxLimit < limits.defaultLimit) {
    throw new Error("Invalid server cursor limits");
  }
  const limit = positiveInteger(single(query, "limit"), limits.defaultLimit, limits.maxLimit);
  const raw = single(query, "cursor");
  return { limit, position: raw === undefined ? null : decodeCursor(raw, decode) };
}
