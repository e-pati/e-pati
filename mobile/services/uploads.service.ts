import { api } from "@/lib/api";

type UploadFolder = "lab-results" | "prescriptions" | "pets";

type PresignedUpload = {
  key: string;
  uploadUrl: string;
  fileUrl: string;
  expiresAt: string;
};

function getFileName(uri: string): string {
  return uri.split("/").pop()?.split("?")[0] || `pet-photo-${Date.now()}.jpg`;
}

function getMimeType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
}

export const uploadsService = {
  async uploadLocalFile(uri: string, folder: UploadFolder): Promise<string> {
    const fileName = getFileName(uri);
    const mimeType = getMimeType(fileName);
    const { data } = await api.post<PresignedUpload>("/uploads/presign", {
      fileName,
      mimeType,
      folder,
    });
    const file = await fetch(uri);
    const blob = await file.blob();

    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": mimeType },
      body: blob,
    });

    return data.fileUrl;
  },
};
