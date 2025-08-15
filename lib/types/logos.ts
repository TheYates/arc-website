export interface Logo {
  id?: string;
  name: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLogoRequest {
  name: string;
  alt: string;
  width?: number;
  height?: number;
  isActive?: boolean;
  sortOrder?: number;
  file?: File;
}

export interface UpdateLogoRequest {
  id: string;
  name?: string;
  alt?: string;
  width?: number;
  height?: number;
  isActive?: boolean;
  sortOrder?: number;
  file?: File;
}

export interface LogoResponse {
  success: boolean;
  data?: Logo | Logo[];
  error?: string;
  message?: string;
}

export interface LogoUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}
