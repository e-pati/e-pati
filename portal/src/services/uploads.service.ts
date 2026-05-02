import { api } from "@/lib/api";

type UploadFolder = "lab-results" | "prescriptions" | "pets";

type PresignedUpload = {
  key: string;
  uploadUrl: string;
  fileUrl: string;
  expiresAt: string;
};

export const uploadsService = {
  async uploadFile(file: File, folder: UploadFolder): Promise<string> {
    const { data } = await api.post<PresignedUpload>("/uploads/presign", {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      folder,
    });

    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });

    return data.fileUrl;
  },
};
