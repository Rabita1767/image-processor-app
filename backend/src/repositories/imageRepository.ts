import mongoose, { Mongoose, Types } from "mongoose";
import ImageModel from "../models/imageModel";
import { IFile, IImage } from "../types";
import imageModel from "../models/imageModel";
class ImageRepository {
  public async uploadImageAsGuest(
    userId: string | undefined,
    fileName: any,
    trackingId: string
  ): Promise<IImage> {
    return await ImageModel.create({
      guestId: userId,
      filename: fileName,
      trackingId: trackingId,
    });
  }

  public async uploadImageAsUser(
    userId: mongoose.Types.ObjectId,
    fileName: any,

    trackingId: string
  ): Promise<IImage> {
    console.log("enterr", userId);
    return await ImageModel.create({
      user: userId,
      filename: fileName,

      trackingId: trackingId,
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

  public async findByIdAndUpdateUpload(
    imgId: string,
    originalImageUrl: string
  ): Promise<IImage | null> {
    return await ImageModel.findByIdAndUpdate(
      imgId,
      {
        originalImageUrl: originalImageUrl,
        status: "uploaded",
      },
      { new: true }
    );
  }

  public async findByUserId(
    userId: mongoose.Types.ObjectId
  ): Promise<IImage[]> {
    return await ImageModel.find({ user: userId });
  }

  public async findImage(userId: mongoose.Types.ObjectId, imageId: string) {
    return await ImageModel.findOne({ _id: imageId, user: userId });
  }

  public async bulkUploadImage(imageDocs: any) {
    return await imageModel.insertMany(imageDocs);
  }
}
export default new ImageRepository();
