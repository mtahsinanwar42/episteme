import { type GetFilesParams } from "@/models/file";
import { fileService } from "@/services/fileService";
import { useQuery } from "@tanstack/react-query";

// Get all users with optional pagination and filtering
export function useFiles(params?: GetFilesParams) {
  return useQuery({
    queryKey: ["files", params],
    queryFn: () => fileService.getFiles(params),
  });
}

// Get all users with optional pagination and filtering
export function useFileById(fileId: string | number | undefined) {
  return useQuery({
    queryKey: ["file", fileId],
    queryFn: () => fileService.getFileById(fileId),
  });
}
