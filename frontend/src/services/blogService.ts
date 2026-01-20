import { api } from "@/services/api";
import type { Blog } from "@/models/blog";

export const blogService = {
  getBlogs: async (): Promise<Blog[]> => {
    return api.get<Blog[]>("/posts", false);
  },

  // Get blogs by user
  getUserBlogs: async (userId: number): Promise<Blog[]> => {
    return api.get<Blog[]>(`/blogs?userId=${userId}`, false);
  },

  // Create blog
  createBlog: async (blog: Omit<Blog, "id">): Promise<Blog> => {
    return api.post<Blog>("/blogs", blog, true);
  },

  // Update blog
  updateBlog: async (id: number, blog: Partial<Blog>): Promise<Blog> => {
    return api.patch<Blog>(`/blogs/${id}`, blog, true);
  },

  // Delete blog
  deleteBlog: async (id: number): Promise<void> => {
    return api.delete<void>(`/blogs/${id}`, true);
  },
};
