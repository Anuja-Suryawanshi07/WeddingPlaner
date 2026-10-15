import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { AppError } from "../errors/app-error";
import { cursorResponse, errorResponse, pageResponse, successResponse } from "./response";

afterEach(() => vi.restoreAllMocks());
describe("API response envelopes", () => {
  it("formats success and creation without adding envelope fields", async () => {
    const ok = successResponse({ success: true });
    expect(ok.status).toBe(200);
    expect(ok.headers.get("cache-control")).toBe("no-store");
    expect(await ok.json()).toEqual({ data: { success: true } });
    const created = successResponse({ id: "example" }, 201);
    expect(created.status).toBe(201);
    expect(await created.json()).toEqual({ data: { id: "example" } });
  });
  it("formats page and cursor lists exactly", async () => {
    expect(await pageResponse([{ id: "one" }], { page: 2, limit: 20, skip: 20 }, 21).json()).toEqual({
      data: [{ id: "one" }], pagination: { page: 2, limit: 20, total: 21, totalPages: 2 },
    });
    expect(await cursorResponse([], null).json()).toEqual({ data: [], pagination: { nextCursor: null } });
    expect(await cursorResponse([1], "opaque").json()).toEqual({ data: [1], pagination: { nextCursor: "opaque" } });
  });
  it("returns safe application errors without logging their content", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const requestId = "08b5882a-b6a9-4a36-8c7c-314b5bad40bc";
    const response = errorResponse(new AppError("VALIDATION_ERROR", { email: "Invalid format" }), { requestId });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: {
      code: "VALIDATION_ERROR", message: "Invalid request data", details: { email: "Invalid format" }, requestId,
    } });
    expect(log).not.toHaveBeenCalled();
  });
  it("correlates unexpected errors without exposing secrets in response or logs", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = errorResponse(new Error("mongodb://private:password@host/db"), { requestId: "secret\r\nforged" });
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ error: {
      code: "INTERNAL_ERROR", message: "An unexpected error occurred", requestId: expect.any(String),
    } });
    expect(log).toHaveBeenCalledExactlyOnceWith({ requestId: body.error.requestId, errorCode: "INTERNAL_ERROR" });
    expect(JSON.stringify([body, log.mock.calls])).not.toMatch(/private|password|secret|forged|mongodb|stack/);
  });
});
