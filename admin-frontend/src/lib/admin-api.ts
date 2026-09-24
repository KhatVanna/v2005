import type { ApiResponse } from "@/types/api";

export async function adminApi<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; payload: ApiResponse<T> }> {
  const response = await fetch(`/api/proxy/v1${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiResponse<T>;
  return { ok: response.ok, status: response.status, payload };
}
