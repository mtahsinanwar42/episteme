export interface File {
  id: number;
  name: string;
  size: number;
  mimeType: string;
  storageKey: string;
  createdAt: string;
}

export interface GetFilesParams {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
  search?: string;
  paginate?: boolean;
  name?: string;
  storageKey?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
}

export interface FileResponse {
  data: File[];
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

export interface FileDetailsResponse {
  data: File;
  success: boolean;
}

export enum FileTypeEnum {
  PROFILE_PHOTOS = "profile_photos",
  CVS = "cvs",
  PAPERS = "papers",
  ASSETS = "assets",
}

export interface FileUploadRequest {
  bucketName: string;
  file: any;
}

export interface FileUploadResponse {
  success: boolean;
  data: {
    bucket: FileTypeEnum;
    file: File;
  };
}
