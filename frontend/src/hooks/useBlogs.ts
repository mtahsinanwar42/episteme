import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "@/services/blogService";
import type { Post } from "@/models/post";

// Get all blogs
export function useBlogs() {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: blogService.getBlogs,
  });
}

// Get user blogs
export function useUserBlogs(userId: number) {
  return useQuery({
    queryKey: ["blogs", "user", userId],
    queryFn: () => blogService.getUserBlogs(userId),
    enabled: !!userId,
  });
}

// Create blog mutation
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blogService.createBlog,
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// Update post mutation
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, blog }: { id: number; blog: Partial<Post> }) =>
      blogService.updateBlog(id, blog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}

// Delete blog mutation
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blogService.deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
}
