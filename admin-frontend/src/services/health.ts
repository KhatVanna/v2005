import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse, HealthData } from "@/types/api";

export async function getHealth(): Promise<HealthData> {
  const response = await apiClient.get<ApiSuccessResponse<HealthData>>("/health");
  return response.data.data;
}
