import { config } from "@/config/config";
import type { Blog } from "@/models/blog";

export const blogService = {
  getBlogs: async (): Promise<Blog[]> => {
    const response = await fetch(`${config.baseUrl}/posts`);
    if (!response.ok) throw new Error("Failed to fetch blogs");
    return response.json();
  },

  // Get blogs by user
  getUserBlogs: async (userId: number): Promise<Blog[]> => {
    const response = await fetch(`${config.baseUrl}/blogs?userId=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user blogs");
    return response.json();
  },

  // Create blog
  createBlog: async (blog: Omit<Blog, "id">): Promise<Blog> => {
    const response = await fetch(`${config.baseUrl}/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    });
    if (!response.ok) throw new Error("Failed to create blog");
    return response.json();
  },

  // Update blog
  updateBlog: async (id: number, blog: Partial<Blog>): Promise<Blog> => {
    const response = await fetch(`${config.baseUrl}/blogs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blog),
    });
    if (!response.ok) throw new Error("Failed to update blog");
    return response.json();
  },

  // Delete blog
  deleteBlog: async (id: number): Promise<void> => {
    const response = await fetch(`${config.baseUrl}/blogs/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete blog");
  },
};
