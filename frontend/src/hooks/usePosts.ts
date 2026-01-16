import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/postService";
import type { Post } from "@/models/post";

// Get all posts
export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: postService.getPosts,
  });
}

// Get user posts
export function useUserPosts(userId: number) {
  return useQuery({
    queryKey: ["posts", "user", userId],
    queryFn: () => postService.getUserPosts(userId),
    enabled: !!userId,
  });
}

// Create post mutation
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.createPost,
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
    mutationFn: ({ id, post }: { id: number; post: Partial<Post> }) =>
      postService.updatePost(id, post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// Delete post mutation
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
