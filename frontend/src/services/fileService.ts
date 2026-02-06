import { api } from "@/services/api";
import type {
  FileResponse,
  FileUploadRequest,
  FileUploadResponse,
  GetFilesParams,
} from "@/models/file";

export const fileService = {
  getFiles: async (params?: GetFilesParams): Promise<FileResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.select) queryParams.append("select", params.select);
    if (params?.paginate !== undefined)
      queryParams.append("paginate", params.paginate.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/files?${queryString}` : "/files";

    return api.get<FileResponse>(endpoint, true);
  },
  getFileById: async (
    fileId: string | number | undefined,
  ): Promise<{ success: boolean; data: any }> => {
    return api.get<{ success: boolean; data: any }>(`/files/${fileId}`, true);
  },
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
  downloadFile: async (filePath: string): Promise<void> => {
    try {
      const blob = await api.getBlob(
        `/files/download?path=${encodeURIComponent(filePath)}`,
        true,
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filePath.split("/").pop() || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("File download error:", error);
      throw error;
    }
  },
  getMetadataFile: async (filePath: string): Promise<any> => {
    return api.metadataFile<any>(`/${filePath}`, false);
  },
};
