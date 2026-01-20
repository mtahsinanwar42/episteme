export interface File {
  id: number;
  name: string;
  size: number;
  mimeType: string;
  storageKey: string;
  createdAt: string;
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
