export interface IImage {
  rawFile: File;
  originalImageFile: string;
  compressedImageFile: string;
  fileName: string;
  imageId: string;
  uploadProgress: number;
  compressProgress: number;
  done: boolean;
  hasCompressionStarted: boolean;
}
