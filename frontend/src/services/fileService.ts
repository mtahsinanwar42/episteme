import { api } from "@/services/api";
import type { FileUploadRequest, FileUploadResponse } from "@/models/file";

export const fileService = {
  uploadFile: async (
    bucketName: string,
    formData: FileUploadRequest["file"],
  ): Promise<FileUploadResponse> => {
    return api.uploadFile<FileUploadResponse>(
      `/files/upload/${bucketName}`,
      formData,
      true,
    );
  },
};
