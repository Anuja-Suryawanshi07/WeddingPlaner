import "server-only";
import { randomUUID } from "node:crypto";

export type RequestContext = Readonly<{ requestId: string }>;

// Do not derive context from request URLs, capability tokens, or untrusted headers.
export function createRequestContext(): RequestContext {
  return Object.freeze({ requestId: randomUUID() });
}

export function safeRequestId(value: string): string {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value : randomUUID();
}

export function reportInternalError(context: RequestContext): void {
  // Deliberately omit the original exception, URL, body, headers and credentials.
  console.error({ requestId: safeRequestId(context.requestId), errorCode: "INTERNAL_ERROR" });
}
