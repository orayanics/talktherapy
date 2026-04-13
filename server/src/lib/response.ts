import { t } from "elysia";
import type { TSchema } from "elysia";

export const ApiResponse = <T extends TSchema>(schema: T) =>
  t.Object({
    success: t.Boolean(),
    data: t.Optional(schema),
    error: t.Optional(t.String()),
  });

export const ApiSuccess = <T extends TSchema>(schema?: T) =>
  t.Object({
    success: t.Literal(true),
    data: schema ? t.Optional(schema) : t.Optional(t.Unknown()),
  });

export const ApiError = t.Object({
  success: t.Literal(false),
  error: t.String(),
  fields: t.Optional(t.Record(t.String(), t.String())),
});

export const ok = <T>(data: T) => ({ success: true as const, data });
export const error = (message: string) => ({
  success: false as const,
  error: message,
});

// try/catch wrapper
// runs the async function then wraps the result in a success shape
export const tryOk = async <T>(
  fn: () => Promise<T>,
  onError?: (err: unknown) => string,
) => {
  try {
    return ok(await fn());
  } catch (err) {
    const message = onError
      ? onError(err) // formatter
      : err instanceof Error
        ? err.message // native error message
        : "An error occurred"; // fallback
    return error(message);
  }
};
