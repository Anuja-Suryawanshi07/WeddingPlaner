import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { decodeCursor, pageMetadata, parseCursorPagination, parsePagePagination, PHOTO_CURSOR_LIMITS } from "./pagination";

describe("page pagination", () => {
  it("uses documented defaults and computes offsets and metadata", () => {
    expect(parsePagePagination(new URLSearchParams())).toEqual({ page: 1, limit: 20, skip: 0 });
    const page = parsePagePagination(new URLSearchParams("page=3&limit=100"));
    expect(page).toEqual({ page: 3, limit: 100, skip: 200 });
    expect(pageMetadata(page, 201)).toEqual({ page: 3, limit: 100, total: 201, totalPages: 3 });
    expect(pageMetadata(page, 0)).toEqual({ page: 3, limit: 100, total: 0, totalPages: 0 });
  });
  it.each(["page=0", "page=-1", "page=1.5", "page=1e2", "page=", "page=01", "limit=101", "limit=0", "limit=-2", "limit=", "page=1&page=2", "limit=1&limit=2", "page=9007199254740992", "page=9007199254740991&limit=100"])("rejects malformed or unsafe pagination: %s", (query) => {
    expect(() => parsePagePagination(new URLSearchParams(query))).toThrow(expect.objectContaining({ code: "VALIDATION_ERROR" }));
  });
  it("rejects invalid server totals and inconsistent offsets", () => {
    for (const total of [-1, 1.5, Infinity, NaN]) {
      expect(() => pageMetadata({ page: 1, limit: 20, skip: 0 }, total)).toThrow("Invalid server pagination metadata");
    }
    expect(() => pageMetadata({ page: 2, limit: 20, skip: 0 }, 30)).toThrow();
  });
});

describe("cursor pagination", () => {
  const position = { createdAt: new Date("2026-01-01T00:00:00Z"), _id: "a".repeat(24) };
  // A test decoder only: production wire encoding remains undecided.
  const decoder = (raw: string) => {
    if (raw !== "test-cursor") throw new Error("private decoder detail");
    return position;
  };
  it("uses photo defaults and validates a caller-decoded position", () => {
    expect(parseCursorPagination(new URLSearchParams(), decoder, PHOTO_CURSOR_LIMITS)).toEqual({ limit: 24, position: null });
    expect(parseCursorPagination(new URLSearchParams("limit=48&cursor=test-cursor"), decoder, PHOTO_CURSOR_LIMITS)).toEqual({ limit: 48, position });
    expect(decodeCursor("test-cursor", decoder)).not.toBe(position);
  });
  it.each(["limit=49", "limit=0", "cursor=", "cursor=a&cursor=b", "limit=2&limit=3", "cursor=unknown"])("rejects invalid cursor queries: %s", (query) => {
    expect(() => parseCursorPagination(new URLSearchParams(query), decoder, PHOTO_CURSOR_LIMITS)).toThrow(expect.objectContaining({ code: "VALIDATION_ERROR" }));
  });
  it.each([null, {}, ["test-cursor"], "", "has space", "bad\nvalue", "bad\u0000value", "a".repeat(2049)])("rejects invalid transport input before decoding: %#", (raw) => {
    const decode = vi.fn(decoder);
    expect(() => decodeCursor(raw, decode)).toThrow(expect.objectContaining({ code: "VALIDATION_ERROR" }));
    expect(decode).not.toHaveBeenCalled();
  });
  it.each([
    { createdAt: "2026-01-01", _id: "a".repeat(24) },
    { createdAt: new Date(NaN), _id: "a".repeat(24) },
    { createdAt: new Date(), _id: "bad" },
    { createdAt: new Date(), _id: { $ne: null } },
    { createdAt: new Date(), _id: "a".repeat(24), $where: "unsafe" },
    null,
  ])("rejects malformed positions and arbitrary query operators: %#", (decoded) => {
    expect(() => decodeCursor("opaque", () => decoded)).toThrow(expect.objectContaining({ code: "VALIDATION_ERROR" }));
  });
  it("sanitizes decoder failures and requires valid caller-provided limits", () => {
    expect(() => decodeCursor("unknown", decoder)).toThrow("Invalid request data");
    expect(() => parseCursorPagination(new URLSearchParams(), decoder, { defaultLimit: 0, maxLimit: 10 })).toThrow("Invalid server cursor limits");
    expect(() => parseCursorPagination(new URLSearchParams(), decoder, { defaultLimit: 20, maxLimit: 10 })).toThrow("Invalid server cursor limits");
  });
});
