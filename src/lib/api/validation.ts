import "server-only";
import { z } from "zod";
import { AppError } from "../errors/app-error";
import type { ValidationMessage } from "../errors/error-codes";

function issueMessage(issue: z.core.$ZodIssue): ValidationMessage {
  switch (issue.code) {
    case "invalid_type": return "Invalid type";
    case "invalid_format": return "Invalid format";
    case "too_small": return "Value too small";
    case "too_big": return "Value too large";
    default: return "Invalid value";
  }
}

// publicFields are static, server-declared paths, never derived from request data.
export async function validate<T>(schema: z.ZodType<T>, input: unknown, publicFields: readonly string[] = []): Promise<T> {
  const result = await schema.safeParseAsync(input);
  if (result.success) return result.data;
  const details: Record<string, ValidationMessage> = Object.create(null);
  for (const issue of result.error.issues) {
    const path = issue.path.map(String).join(".");
    const key = publicFields.includes(path) ? path : "_form";
    details[key] ??= issueMessage(issue);
  }
  throw new AppError("VALIDATION_ERROR", details);
}

export async function validateJsonBody<T>(request: Request, schema: z.ZodType<T>, publicFields?: readonly string[]): Promise<T> {
  let body: unknown;
  try { body = await request.json(); }
  catch { throw new AppError("VALIDATION_ERROR"); }
  return validate(schema, body, publicFields);
}

export async function validateQuery<T>(
  query: URLSearchParams,
  schema: z.ZodType<T>,
  publicFields?: readonly string[],
  options: { multiValueParams?: readonly string[] } = {},
): Promise<T> {
  // This allowlist is server-declared, never derived from request input.
  const multiValueParams = new Set(options.multiValueParams);
  const input: Record<string, string | string[]> = Object.create(null);
  for (const key of new Set(query.keys())) {
    const values = query.getAll(key);
    if (values.length > 1 && !multiValueParams.has(key)) {
      // Do not echo arbitrary parameter names or values.
      throw new AppError("VALIDATION_ERROR");
    }
    // Declared multi-valued parameters consistently receive arrays, even for one value.
    input[key] = multiValueParams.has(key) ? values : values[0];
  }
  return validate(schema, input, publicFields);
}

export async function validateRouteParams<T>(params: unknown | Promise<unknown>, schema: z.ZodType<T>, publicFields?: readonly string[]): Promise<T> {
  return validate(schema, await params, publicFields);
}
