export interface IImage {
  originalImageFile: string;
  compressedImageFile: string;
  fileName: string;
  imageId: string;
  progress: number;
  done: boolean;
}
