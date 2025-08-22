export interface IImage {
  rawFile: File;
  originalImageFile: string;
  compressedImageFile: string;
  fileName: string;
  imageId: string;
  progress: number;
  done: boolean;
}
