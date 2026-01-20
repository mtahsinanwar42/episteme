import { config } from "@/config/config";
import type { FileUploadRequest } from "@/models/file";
import Cookies from "js-cookie";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class BaseApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.baseUrl;
  }

  private getHeaders(
    requiresAuth: boolean = false,
    customHeaders?: HeadersInit,
  ): HeadersInit {
    let headers: HeadersInit = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    if (requiresAuth) {
      const token = Cookies.get("token");
      if (token) {
        headers = {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      requiresAuth = false,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(requiresAuth, customHeaders);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(
          error.message || `Request failed with status ${response.status}`,
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async get<T>(endpoint: string, requiresAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      requiresAuth,
    });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    requiresAuth: boolean = false,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    requiresAuth: boolean = false,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    requiresAuth: boolean = false,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
      requiresAuth,
    });
  }

  async delete<T>(endpoint: string, requiresAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      requiresAuth,
    });
  }

  async uploadFile<T>(
    endpoint: string,
    formData: FileUploadRequest["file"],
    requiresAuth: boolean = false,
  ): Promise<T> {
    const headers: HeadersInit = {};
    if (requiresAuth) {
      const token = Cookies.get("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(
          error.message || `Upload failed with status ${response.status}`,
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred during upload");
    }
  }
}

export const api = new BaseApiService();
