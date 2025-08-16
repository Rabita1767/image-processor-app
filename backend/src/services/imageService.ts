import { getRabbitChannel } from "../config/rabbitMq";
import HTTP_STATUS from "../constants/statusCode";
import imageRepository from "../repositories/imageRepository";
import { IImage, IFile } from "../types";
import AppError from "../utils/AppError";
import { generateToken } from "../utils/common";
import { Messages } from "../utils/messages";
import fs from "fs";
import mongoose from "mongoose";
import { consumeQueue } from "../workers/worker";

class ImageService {
  public async downloadProcessedImage(params: { url: string }): Promise<any> {
    try {
      const { url } = params;
      if (!url) {
        throw new AppError(
          Messages.INVALID_PARAMETERS,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const response = await fetch(url);
      return response;
    } catch (error) {
      console.log(error);
      throw new Error(Messages.ERROR_DOWNLOADING_IMAGE);
    }
  }

  public async getImageById(params: { id: string }): Promise<IImage | null> {
    try {
      const { id } = params;
      if (!id) {
        throw new Error(Messages.INVALID_PARAMETERS);
      }
      const findImageById = await imageRepository.findImageById(id);
      if (!findImageById) {
        throw new Error(Messages.IMAGE_NOT_FOUND);
      }
      return findImageById;
    } catch (error) {
      console.log(error);
      throw new Error(Messages.IMAGE_NOT_FOUND);
    }
  }

  public async uploadAndCompress(
    userId: mongoose.Types.ObjectId | undefined,
    payload: IFile | undefined
  ): Promise<string> {
    try {
      if (!payload) {
        throw new AppError(Messages.FILE_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
      }
      if (!userId) {
        const customUserId = new mongoose.Types.ObjectId();
        userId = customUserId;
        console.log("User ID:", userId);
      }
      const uploadImage = await imageRepository.uploadImage(userId, payload);
      if (!uploadImage) {
        throw new AppError(
          Messages.IMAGE_NOT_UPLOADED,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const channel = await getRabbitChannel();
      const filePath = payload.path;
      const imageBuffer = fs.readFileSync(filePath);
      channel.sendToQueue(
        "compress",
        Buffer.from(
          JSON.stringify({
            imageId: uploadImage._id,
            image: imageBuffer.toString("base64"),
            userId: uploadImage.user,
            fileName: uploadImage.filename,
          })
        )
      );
      console.log("Message sent to queue");
      return payload.path;
    } catch (error) {
      console.log(error);
      throw new AppError(
        Messages.ERROR_UPLOADING_IMAGE,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  public async getUserImages(userId: string): Promise<IImage[]> {
    try {
      if (!userId) {
        throw new AppError(Messages.INVALID_USER_ID, HTTP_STATUS.BAD_REQUEST);
      }
      const images = await imageRepository.findByUserId(userId);
      if (!images) {
        throw new AppError(Messages.IMAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      return images;
    } catch (error) {
      console.log(error);
      throw new AppError(
        Messages.ERROR_FETCHING_IMAGES,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
export default new ImageService();
