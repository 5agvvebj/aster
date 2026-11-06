import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "invalid_input", message: "Please check your input and try again." } },
      { status: 400 },
    );
  }

  console.error(JSON.stringify({
    event: "api_unhandled_error",
    message: error instanceof Error ? error.message : "Unknown server error",
    timestamp: new Date().toISOString(),
  }));
  return NextResponse.json(
    { error: { code: "internal_error", message: "Something went wrong. Please try again." } },
    { status: 500 },
  );
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const requestOrigin = new URL(request.url).origin;
  if (origin !== requestOrigin) {
    throw new ApiError(403, "cross_origin_request", "This request could not be verified.");
  }
}

export async function readJsonBody<T>(request: Request, schema: {
  safeParse: (input: unknown) =>
    | { success: true; data: T }
    | { success: false; error: ZodError };
}): Promise<T> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_192) {
    throw new ApiError(413, "request_too_large", "That request is too large.");
  }
  if (!request.headers.get("content-type")?.toLocaleLowerCase().includes("application/json")) {
    throw new ApiError(415, "unsupported_media_type", "Please send a JSON request.");
  }

  let payload: unknown;
  try {
    if (!request.body) throw new ApiError(400, "invalid_json", "Please send a valid request.");
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let byteLength = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > 8_192) {
        await reader.cancel();
        throw new ApiError(413, "request_too_large", "That request is too large.");
      }
      chunks.push(value);
    }
    const body = new Uint8Array(byteLength);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    payload = JSON.parse(new TextDecoder().decode(body));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "invalid_json", "Please send a valid request.");
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ApiError(400, "invalid_input", "Please check your input and try again.");
  }
  return result.data;
}
