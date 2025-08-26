export interface IError {
  errors: {
    type: string;
    value: string;
    msg: string;
    path: string;
    location: string;
  }[];
}
export interface IImage {
  rawFile: File;
  trackingId: string;
  originalImageFile: string;
  compressedImageFile: string;
  fileName: string;
  imageId: string;
  uploadProgress: number;
  compressProgress: number;
  done: boolean;
  hasCompressionStarted: boolean;
}

export interface IImageResponse {
  _id: string;
  user?: string;
  guestId?: string;
  trackingId: string;
  filename: string;
  originalImageUrl: string;
  processedImageUrl?: string;
  status: "pending" | "processing" | "done" | "failed";
}
export interface IUser {
  _id: string;
  email: string;
  userName: string;
}
export interface ILoginData {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface ILoginResponse {
  success: boolean;
  message: string;
  error: IError | null;
  result: ILoginData;
}

export interface IRefreshResponse {
  success: boolean;
  message: string;
  result: string;
  error: IError | null;
}
