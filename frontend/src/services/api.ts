import { config } from "@/config/config";
import type { FileUploadRequest } from "@/models/file";
import { isTokenExpired } from "@/utils/tokenValidator";
import Cookies from "js-cookie";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

interface ApiError extends Error {
  status?: number;
}

class BaseApiService {
  private baseUrl: string;
  private onUnauthorized?: () => void;

  constructor() {
    this.baseUrl = config.baseUrl;
  }

  /**
   * Set callback function to be called when token is unauthorized/expired
   * This is used to dispatch logout action from Redux
   */
  setUnauthorizedCallback(callback: () => void) {
    this.onUnauthorized = callback;
  }

  /**
   * Check if token is valid before making authenticated requests
   */
  private checkTokenValidity(): boolean {
    const token = Cookies.get("token");

    if (!token) {
      return false;
    }

    if (isTokenExpired(token)) {
      // Token is expired, remove it and trigger unauthorized callback
      Cookies.remove("token");
      this.onUnauthorized?.();
      return false;
    }

    return true;
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
      if (token && !isTokenExpired(token)) {
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

    // Check token validity for authenticated requests
    if (requiresAuth && !this.checkTokenValidity()) {
      const error: ApiError = new Error("Token is expired or invalid");
      error.status = 401;
      throw error;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(requiresAuth, customHeaders);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (response.status === 401) {
        Cookies.remove("token");
        this.onUnauthorized?.();
      }

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

  async getBlob(
    endpoint: string,
    requiresAuth: boolean = false,
  ): Promise<Blob> {
    const url = `${this.baseUrl}${endpoint}`;

    // Check token validity for authenticated requests
    if (requiresAuth && !this.checkTokenValidity()) {
      const error: ApiError = new Error("Token is expired or invalid");
      error.status = 401;
      throw error;
    }

    const headers = this.getHeaders(requiresAuth, {});

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (response.status === 401) {
        Cookies.remove("token");
        this.onUnauthorized?.();
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
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

      if (response.status === 401) {
        Cookies.remove("token");
        this.onUnauthorized?.();
      }

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

  async metadataFile<T>(
    endpoint: string,
    requiresAuth: boolean = false,
  ): Promise<T> {
    const headers: HeadersInit = {};
    if (requiresAuth) {
      const token = Cookies.get("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const url = `${new URL(this.baseUrl).origin}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (response.status === 401) {
        Cookies.remove("token");
        this.onUnauthorized?.();
      }

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
      throw new Error("An unexpected error occurred during request");
    }
  }
}

export const api = new BaseApiService();
