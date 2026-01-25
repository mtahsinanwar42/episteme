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
    if (params?.search) queryParams.append("search", params.search);
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
};
