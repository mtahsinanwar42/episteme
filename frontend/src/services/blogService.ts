import { api } from "./api";
import type {
  BlogResponse,
  BlogDetailsResponse,
  GetBlogsParams,
  CreateBlogRequest,
  UpdateBlogRequest,
} from "@/models/blog";

export const blogService = {
  getBlogs: async (params?: GetBlogsParams): Promise<BlogResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.select) queryParams.append("select", params.select);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status !== undefined)
      queryParams.append("status", params.status.toString());
    if (params?.statusIn)
      queryParams.append("status[in]", params.statusIn);
    if (params?.title) queryParams.append("title[iLike]", params.title);
    if (params?.createdAtFrom)
      queryParams.append("createdAt[gte]", params.createdAtFrom);
    if (params?.createdAtTo)
      queryParams.append("createdAt[lte]", `${params.createdAtTo}T23:59:59`);
    if (params?.paginate !== undefined)
      queryParams.append("paginate", params.paginate.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/blogs?${queryString}` : "/blogs";

    return api.get<BlogResponse>(endpoint, false);
  },

  getBlogById: async (
    blogId: string | number,
  ): Promise<BlogDetailsResponse> => {
    return api.get<BlogDetailsResponse>(`/blogs/${blogId}`, false);
  },

  createBlog: async (data: CreateBlogRequest): Promise<BlogDetailsResponse> => {
    return api.post<BlogDetailsResponse>("/blogs", data, true);
  },

  updateBlog: async (
    blogId: string | number,
    data: UpdateBlogRequest,
  ): Promise<BlogDetailsResponse> => {
    return api.put<BlogDetailsResponse>(`/blogs/${blogId}`, data, true);
  },
};
