import { api } from "@/services/api";
import type { Post } from "@/models/post";

export const postService = {
  getPosts: async (): Promise<Post[]> => {
    return api.get<Post[]>("/posts", false);
  },

  // Get posts by user
  getUserPosts: async (userId: number): Promise<Post[]> => {
    return api.get<Post[]>(`/posts?userId=${userId}`, false);
  },

  // Create post
  createPost: async (post: Omit<Post, "id">): Promise<Post> => {
    return api.post<Post>("/posts", post, true);
  },

  // Update post
  updatePost: async (id: number, post: Partial<Post>): Promise<Post> => {
    return api.patch<Post>(`/posts/${id}`, post, true);
  },

  // Delete post
  deletePost: async (id: number): Promise<void> => {
    return api.delete<void>(`/posts/${id}`, true);
  },
};
