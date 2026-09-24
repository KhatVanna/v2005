import type { ApiResponse } from "@/types/api";

export async function storeApi<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; payload: ApiResponse<T> }> {
  try {
    const response = await fetch(`/api/proxy/v1${path}`, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
      signal: init?.signal ?? AbortSignal.timeout(10_000),
    });

    const payload = (await response.json()) as ApiResponse<T>;
    return { ok: response.ok, status: response.status, payload };
  } catch {
    return {
      ok: false,
      status: 503,
      payload: {
        success: false,
        message: "API temporarily unavailable. Please try again.",
      },
    };
  }
}
