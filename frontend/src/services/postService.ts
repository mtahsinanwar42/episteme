import { config } from "@/config/config";
import type { Post } from "@/models/post";

export const postService = {
  getPosts: async (): Promise<Post[]> => {
    const response = await fetch(`${config.baseUrl}/posts`);
    if (!response.ok) throw new Error("Failed to fetch posts");
    return response.json();
  },

  // Get posts by user
  getUserPosts: async (userId: number): Promise<Post[]> => {
    const response = await fetch(`${config.baseUrl}/posts?userId=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user posts");
    return response.json();
  },

  // Create post
  createPost: async (post: Omit<Post, "id">): Promise<Post> => {
    const response = await fetch(`${config.baseUrl}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });
    if (!response.ok) throw new Error("Failed to create post");
    return response.json();
  },

  // Update post
  updatePost: async (id: number, post: Partial<Post>): Promise<Post> => {
    const response = await fetch(`${config.baseUrl}/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });
    if (!response.ok) throw new Error("Failed to update post");
    return response.json();
  },

  // Delete post
  deletePost: async (id: number): Promise<void> => {
    const response = await fetch(`${config.baseUrl}/posts/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete post");
  },
};
