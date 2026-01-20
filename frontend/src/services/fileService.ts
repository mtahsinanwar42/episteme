import { config } from "@/config/config";

import type { FileUploadRequest, FileUploadResponse } from "@/models/file";
import Cookies from "js-cookie";

export const fileService = {
  uploadFile: async (
    bucketName: string,
    formData: FileUploadRequest["file"],
  ): Promise<FileUploadResponse> => {
    const response = await fetch(
      `${config.baseUrl}/files/upload/${bucketName}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${Cookies.get("token") || ""}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "File upload failed");
    }

    return response.json();
  },
};
