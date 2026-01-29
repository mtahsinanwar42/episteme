import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/fileService";

export function useMetadataFile({
  filePath,
  resourceId,
}: {
  filePath: string;
  resourceId: string | number;
}) {
  return useQuery({
    queryKey: ["metadataFile", resourceId],
    queryFn: () => fileService.getMetadataFile(filePath),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
    refetchOnWindowFocus: false,
  });
}
