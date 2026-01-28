import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "@/services/blogService";
import type {
  CreateBlogRequest,
  UpdateBlogRequest,
  GetBlogsParams,
} from "@/models/blog";

export function useBlogs(params?: GetBlogsParams) {
  return useQuery({
    queryKey: ["blogs", params],
    queryFn: () => blogService.getBlogs(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useBlogById(blogId: string | number | undefined) {
  return useQuery({
    queryKey: ["blog", blogId],
    queryFn: () => blogService.getBlogById(blogId!),
    enabled: !!blogId,
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateBlogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogRequest) => blogService.createBlog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}

export function useUpdateBlogMutation(blogId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBlogRequest) =>
      blogService.updateBlog(blogId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", blogId] });
    },
  });
}
