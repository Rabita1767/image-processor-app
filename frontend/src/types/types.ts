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
