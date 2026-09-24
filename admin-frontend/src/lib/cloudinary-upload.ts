import type { ApiResponse } from "@/types/api";
import { adminApi } from "@/lib/admin-api";

export type CloudinarySignature = {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  folder: string;
  signature: string;
  upload_url: string;
};

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
};

export async function uploadProductImageToCloudinary(
  file: File
): Promise<CloudinaryUploadResult> {
  const { ok, payload } = await adminApi<CloudinarySignature>(
    "/admin/media/cloudinary-signature",
    { method: "POST", body: "{}" }
  );

  if (!ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Unable to get Cloudinary signature.");
  }

  const signed = payload.data;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signed.api_key);
  formData.append("timestamp", String(signed.timestamp));
  formData.append("signature", signed.signature);
  formData.append("folder", signed.folder);

  const response = await fetch(signed.upload_url, {
    method: "POST",
    body: formData,
  });

  const result = (await response.json()) as CloudinaryUploadResult & {
    error?: { message?: string };
  };

  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || "Cloudinary upload failed.");
  }

  return result;
}

export async function attachProductImage(
  productId: number,
  path: string,
  altText?: string
): Promise<ApiResponse<{ product: unknown }>> {
  const { ok, payload } = await adminApi<{ product: unknown }>(
    `/admin/products/${productId}/images`,
    {
      method: "POST",
      body: JSON.stringify({
        path,
        alt_text: altText ?? null,
        is_primary: true,
      }),
    }
  );

  if (!ok || !payload.success) {
    throw new Error(payload.message || "Unable to attach product image.");
  }

  return payload;
}
