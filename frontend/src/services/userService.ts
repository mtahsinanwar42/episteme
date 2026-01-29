import type { UserDetailsResponse, UserResponse } from "@/models/user";
import { api } from "./api";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  roles?: string;
  status?: number;
  search?: string;
  paginate?: boolean;
}

export const userService = {
  getUsers: async (params?: GetUsersParams): Promise<UserResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.select) queryParams.append("select", params.select);
    if (params?.roles) queryParams.append("roles[contains]", params.roles);
    if (params?.status !== undefined)
      queryParams.append("status", params.status.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.paginate !== undefined)
      queryParams.append("paginate", params.paginate.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : "/users";

    return api.get<UserResponse>(endpoint, true);
  },
  getUserById: async (
    userId: string | number,
  ): Promise<UserDetailsResponse> => {
    return api.get<UserDetailsResponse>(`/users/${userId}`, true);
  },
  updateUserById: async (
    userId: string | number,
    postData: any,
  ): Promise<{ success: boolean; data: any }> => {
    return api.put<{ success: boolean; data: any }>(
      `/users/${userId}`,
      postData,
      true,
    );
  },
  createUser: async (
    postData: any,
  ): Promise<{ success: boolean; data: any }> => {
    return api.post<{ success: boolean; data: any }>("/users", postData, true);
  },
};
