import type { UserDetailsResponse, UserResponse } from "@/models/user";
import { api } from "./api";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  institution?: string;
  occupation?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  roles?: string;
  status?: number;
  statusIn?: string;
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
    if (params?.firstName) queryParams.append("firstName[iLike]", params.firstName);
    if (params?.lastName) queryParams.append("lastName[iLike]", params.lastName);
    if (params?.email) queryParams.append("email[iLike]", params.email);
    if (params?.institution)
      queryParams.append("institution[iLike]", params.institution);
    if (params?.occupation)
      queryParams.append("occupation[iLike]", params.occupation);
    if (params?.createdAtFrom)
      queryParams.append("createdAt[gte]", params.createdAtFrom);
    if (params?.createdAtTo)
      queryParams.append("createdAt[lte]", `${params.createdAtTo}T23:59:59`);
    if (params?.roles) queryParams.append("roles[contains]", params.roles);
    if (params?.status !== undefined)
      queryParams.append("status", params.status.toString());
    if (params?.statusIn) queryParams.append("status[in]", params.statusIn);
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
  getCountries: async (): Promise<{ success: boolean; data: string[] }> => {
    return api.get<{ success: boolean; data: string[] }>(
      "/reference-data/countries",
      false,
    );
  },
};
