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
