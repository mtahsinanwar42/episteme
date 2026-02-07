export interface BlogResponse {
  data: Blog[];
  success: boolean;
  total: number;
  pagination?: {
    next?: {
      page: number;
      limit: number;
    };
    prev?: {
      page: number;
      limit: number;
    };
  };
}

export interface BlogDetailsResponse {
  data: Blog;
  success: boolean;
}

export interface Blog {
  id: string | number;
  title: string;
  status: number;
  metadataFilePath?: string;
  createdAt: string;
  updatedAt: string;
}

export enum BlogStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  DELETED = 9,
}

export interface GetBlogsParams {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  search?: string;
  paginate?: boolean;
  status?: number;
  statusIn?: string;
  title?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
}

export interface CreateBlogRequest {
  title: string;
  metadataFilePath: string;
  status: number;
}

export interface UpdateBlogRequest {
  title: string;
  metadataFilePath: string;
  status: number;
}
