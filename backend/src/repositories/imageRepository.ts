import mongoose, { Types } from "mongoose";
import ImageModel from "../models/imageModel";
import { IFile, IImage } from "../types";
class ImageRepository {
  public async uploadImageAsGuest(
    payload: any,
    originalImageUrl: string
  ): Promise<IImage> {
    console.log("payloadddddddd", payload);
    return await ImageModel.create({
      guestId: payload?.userId,
      filename: payload.fileName,
      originalImageUrl: originalImageUrl,
    });
  }

  public async uploadImage(
    userId: Types.ObjectId | undefined,
    payload: IFile
  ): Promise<IImage> {
    console.log("userrrrr", userId);
    return await ImageModel.create({
      user: userId,
      filename: payload.filename,
      originalPath: payload.path,
    });
  }

  public async findImageById(id: string): Promise<IImage | null> {
    return await ImageModel.findById({ _id: id });
  }

  public async findByIdAndUpdate(
    imgId: string,
    outputPath: string
  ): Promise<IImage | null> {
    return await ImageModel.findByIdAndUpdate(
      imgId,
      {
        processedImageUrl: outputPath,
        status: "done",
      },
      { new: true }
    );
  }
}
export default new ImageRepository();
