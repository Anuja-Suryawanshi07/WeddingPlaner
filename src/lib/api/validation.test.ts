import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
vi.mock("server-only", () => ({}));
import { validate, validateJsonBody, validateQuery, validateRouteParams } from "./validation";
import { mapError } from "../errors/map-error";

describe("request validation", () => {
  it("returns parsed JSON with schema defaults, stripping and transformations", async () => {
    const request = new Request("http://localhost", { method: "POST", body: JSON.stringify({ name: " Ada ", extra: "ignored" }) });
    const schema = z.object({ name: z.string().trim(), enabled: z.boolean().default(true) });
    await expect(validateJsonBody(request, schema)).resolves.toEqual({ name: "Ada", enabled: true });
  });
  it("supports asynchronous schema refinements", async () => {
    const schema = z.string().refine(async (value) => value === "allowed");
    await expect(validate(schema, "allowed")).resolves.toBe("allowed");
    await expect(validate(schema, "denied")).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
  it.each(["", "{", "null", "[]"])("rejects invalid JSON or the wrong body shape: %#", async (body) => {
    const request = new Request("http://localhost", { method: "POST", body });
    await expect(validateJsonBody(request, z.object({ name: z.string() }))).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
  it("sanitizes custom Zod messages and dynamic keys, retaining declared field errors", async () => {
    const schema = z.object({
      email: z.email({ error: "secret supplied email" }),
      values: z.record(z.string(), z.string()),
    });
    const error = await validate(schema, { email: "private", values: { "secret-key": 123 } }, ["email"]).catch((error: unknown) => error);
    expect(mapError(error)).toEqual({ status: 400, error: {
      code: "VALIDATION_ERROR", message: "Invalid request data",
      details: { email: "Invalid format", _form: "Invalid type" },
    } });
    expect(JSON.stringify(mapError(error))).not.toMatch(/secret|private|123/);
  });
  it("validates query coercion and rejects repeated scalar parameters", async () => {
    const schema = z.object({ count: z.coerce.number().int().positive() });
    await expect(validateQuery(new URLSearchParams("count=3"), schema)).resolves.toEqual({ count: 3 });
    await expect(validateQuery(new URLSearchParams("count=3&count=4"), schema)).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await expect(validateQuery(new URLSearchParams("count=invalid"), schema)).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
  it("retains repeated query values for explicitly array-valued schemas", async () => {
    await expect(validateQuery(new URLSearchParams("tag=a&tag=b"), z.object({ tag: z.array(z.string()) }), undefined, { multiValueParams: ["tag"] })).resolves.toEqual({ tag: ["a", "b"] });
  });
  it.each([
    ["string", z.coerce.string()],
    ["boolean", z.coerce.boolean()],
    ["number", z.coerce.number()],
  ])("rejects duplicate parameters before %s coercion executes", async (_, fieldSchema) => {
    const preprocess = vi.fn((input: unknown) => input);
    const schema = z.preprocess(preprocess, z.object({ value: fieldSchema }));
    await expect(validateQuery(new URLSearchParams("value=false&value=true"), schema))
      .rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(preprocess).not.toHaveBeenCalled();
  });
  it("rejects duplicates even when the schema accepts arrays unless explicitly permitted", async () => {
    await expect(validateQuery(new URLSearchParams("tag=a&tag=b"), z.object({ tag: z.array(z.string()) })))
      .rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
  it("allows only the named multi-valued parameters", async () => {
    const schema = z.object({ tag: z.array(z.string()), name: z.coerce.string() });
    await expect(validateQuery(new URLSearchParams("tag=a&tag=b&name=one&name=two"), schema, undefined, {
      multiValueParams: ["tag"],
    })).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
  it("preserves single scalars and normalizes declared multi-valued parameters", async () => {
    const schema = z.object({
      name: z.coerce.string(), enabled: z.coerce.boolean(), count: z.coerce.number(),
      tag: z.array(z.string()), optionalTag: z.array(z.string()).optional(),
    });
    await expect(validateQuery(new URLSearchParams("name=Ada&enabled=true&count=3&tag=a"), schema, undefined, {
      multiValueParams: ["tag", "optionalTag"],
    })).resolves.toEqual({ name: "Ada", enabled: true, count: 3, tag: ["a"] });
  });
  it("still validates explicitly permitted arrays with Zod", async () => {
    await expect(validateQuery(new URLSearchParams("tag=a&tag="), z.object({
      tag: z.array(z.string().min(1)),
    }), undefined, { multiValueParams: ["tag"] })).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
  it("sanitizes unexpected duplicate names and values", async () => {
    const error = await validateQuery(
      new URLSearchParams("private-key=secret-one&private-key=secret-two"),
      z.object({}),
    ).catch((error: unknown) => error);
    expect(mapError(error)).toEqual({
      status: 400, error: { code: "VALIDATION_ERROR", message: "Invalid request data" },
    });
    expect(JSON.stringify(mapError(error))).not.toMatch(/private|secret/);
  });
  it("does not let query keys mutate object prototypes", async () => {
    await expect(validateQuery(new URLSearchParams("__proto__=private"), z.strictObject({}))).rejects.toMatchObject({
      code: "VALIDATION_ERROR", details: { _form: "Invalid value" },
    });
    expect(Object.prototype).not.toHaveProperty("private");
  });
  it("validates promised route params and rejects malformed identifiers", async () => {
    const schema = z.object({ id: z.string().regex(/^[a-f0-9]{24}$/) });
    await expect(validateRouteParams(Promise.resolve({ id: "a".repeat(24) }), schema)).resolves.toEqual({ id: "a".repeat(24) });
    await expect(validateRouteParams({ id: { $ne: null } }, schema)).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await expect(validateRouteParams({}, schema)).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
  it("leaves programming failures for the sanitized internal error mapper", async () => {
    const schema = z.string().transform(() => { throw new Error("private implementation details"); });
    const error = await validate(schema, "ok").catch((error: unknown) => error);
    expect(mapError(error)).toEqual({ status: 500, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } });
  });
});
