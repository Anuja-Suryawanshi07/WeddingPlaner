import "server-only";
import { mapError } from "../errors/map-error";
import { createRequestContext, reportInternalError, type RequestContext } from "./request-context";
import { pageMetadata, type PagePagination } from "./pagination";

export function successResponse<T>(data: T, status: 200 | 201 = 200): Response {
  return Response.json({ data }, { status, headers: { "Cache-Control": "no-store" } });
}

export function pageResponse<T>(data: readonly T[], page: PagePagination, total: number): Response {
  return Response.json({ data, pagination: pageMetadata(page, total) }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export function cursorResponse<T>(data: readonly T[], nextCursor: string | null): Response {
  return Response.json({ data, pagination: { nextCursor } }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export function errorResponse(error: unknown, context: RequestContext = createRequestContext()): Response {
  const mapped = mapError(error, context.requestId);
  if (mapped.error.code === "INTERNAL_ERROR") {
    reportInternalError({ requestId: mapped.error.requestId! });
  }
  return Response.json({ error: mapped.error }, {
    status: mapped.status,
    headers: { "Cache-Control": "no-store" },
  });
}
