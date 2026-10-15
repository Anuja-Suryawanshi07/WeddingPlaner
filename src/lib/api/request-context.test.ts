import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { createRequestContext, safeRequestId } from "./request-context";

describe("request context", () => {
  it("generates immutable independent UUID contexts without trusting incoming headers", () => {
    const first = createRequestContext();
    const second = createRequestContext();
    expect(first.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(second.requestId).not.toBe(first.requestId);
    expect(Object.isFrozen(first)).toBe(true);
    expect(safeRequestId(first.requestId)).toBe(first.requestId);
  });
  it.each(["", "secret", "id\r\nforged-log", "a".repeat(1000)])("replaces unsafe correlation identifiers: %#", (input) => {
    expect(safeRequestId(input)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});
