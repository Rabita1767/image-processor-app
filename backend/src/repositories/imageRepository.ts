import mongoose, { Mongoose, Types } from "mongoose";
import ImageModel from "../models/imageModel";
import { IFile, IImage } from "../types";
class ImageRepository {
  public async uploadImageAsGuest(
    userId: string | undefined,
    fileName: any,
    originalImageUrl: string
  ): Promise<IImage> {
    return await ImageModel.create({
      guestId: userId,
      filename: fileName,
      originalImageUrl: originalImageUrl,
    });
  }

  public async uploadImageAsUser(
    userId: string | undefined,
    fileName: any,
    originalImageUrl: string
  ): Promise<IImage> {
    console.log("enterr", userId);
    return await ImageModel.create({
      user: userId,
      filename: fileName,
      originalImageUrl: originalImageUrl,
    });
  }

  public async uploadImage(
    userId: mongoose.Types.ObjectId | undefined,
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

  public async findByUserId(
    userId: mongoose.Types.ObjectId
  ): Promise<IImage[]> {
    return await ImageModel.find({ user: userId });
  }
}
export default new ImageRepository();
