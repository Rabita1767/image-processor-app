export interface IImage {
  base64: string;
  originalImageFile: string;
  compressedImageFile: string;
  fileName: string;
  imageId: string;
  progress: number;
  done: boolean;
}
