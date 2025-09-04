import { getRabbitChannel } from "../config/rabbitMq";
import HTTP_STATUS from "../constants/statusCode";
import imageRepository from "../repositories/imageRepository";
import { IImage, IFile, IUploadPayload } from "../types";
import AppError from "../utils/AppError";
import { generateToken } from "../utils/common";
import { Messages } from "../utils/messages";
import fs from "fs";
import mongoose from "mongoose";
import { consumeQueue } from "../workers/worker";
import uploadToCloudinaryFromBuffer from "../utils/cloudinary";
import axios from "axios";

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

  public async getUserImages(
    userId: mongoose.Types.ObjectId | undefined
  ): Promise<IImage[]> {
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

  // public async uploadImage(
  //   file: any,
  //   payload: IUploadPayload,
  //   userId?: mongoose.Types.ObjectId
  // ) {
  //   try {
  //     if (!file) {
  //       throw new AppError(
  //         Messages.PLEASE_UPLOAD_A_FILE,
  //         HTTP_STATUS.BAD_REQUEST
  //       );
  //     }
  //     const { buffer, originalname } = file;
  //     const imageUrl = await uploadToCloudinaryFromBuffer(buffer, originalname);
  //     let uploadImage;
  //     if (userId) {
  //       uploadImage = await imageRepository.uploadImageAsUser(
  //         userId,
  //         originalname,
  //         imageUrl,
  //         payload.trackingId
  //       );
  //     } else {
  //       uploadImage = await imageRepository.uploadImageAsGuest(
  //         payload.guestId,
  //         originalname,
  //         imageUrl,
  //         payload.trackingId
  //       );
  //     }
  //     if (!uploadImage) {
  //       throw new AppError(
  //         Messages.ERROR_UPLOADING_IMAGE,
  //         HTTP_STATUS.BAD_REQUEST
  //       );
  //     }
  //     return uploadImage;
  //   } catch (error) {
  //     console.log(error);
  //     throw new AppError(
  //       Messages.ERROR_UPLOADING_IMAGE,
  //       HTTP_STATUS.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  public async uploadImage(
    file: any,
    payload: IUploadPayload,
    userId?: mongoose.Types.ObjectId
  ) {
    try {
      if (!file) {
        throw new AppError(
          Messages.PLEASE_UPLOAD_A_FILE,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const { buffer, originalname } = file;
      let uploadImage;
      if (userId) {
        uploadImage = await imageRepository.uploadImageAsUser(
          userId,
          originalname,
          payload.trackingId
        );
      } else {
        uploadImage = await imageRepository.uploadImageAsGuest(
          payload.guestId,
          originalname,
          payload.trackingId
        );
      }
      if (!uploadImage) {
        throw new AppError(
          Messages.ERROR_UPLOADING_IMAGE,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const channel = await getRabbitChannel();
      channel.sendToQueue(
        "upload",
        Buffer.from(
          JSON.stringify({
            imageId: uploadImage._id,
            imageBuffer: buffer.toString("base64"),
            originalname: originalname,
            userId: userId ? userId : payload.guestId,
          })
        )
      );

      return uploadImage;
    } catch (error) {
      console.log(error);
      throw new AppError(
        Messages.ERROR_UPLOADING_IMAGE,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async bulkUploadImage(
    files: any,
    payload: IUploadPayload,
    userId?: mongoose.Types.ObjectId
  ) {
    try {
      if (!files || !Array.isArray(files)) {
        throw new AppError(
          Messages.PLEASE_UPLOAD_FILES,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      const uploadedToCloudinary = await Promise.all(
        files.map((file) =>
          uploadToCloudinaryFromBuffer(file.buffer, file.originalname)
        )
      );

      let imageDocs;
      let uploadImages;
      if (userId) {
        imageDocs = uploadedToCloudinary.map((url, index) => {
          return {
            user: userId,
            filename: files[index].originalname,
            originalImageUrl: url,
            trackingId: payload.trackingId,
          };
        });
        uploadImages = await imageRepository.bulkUploadImage(imageDocs);
      } else {
        imageDocs = uploadedToCloudinary.map((url, index) => {
          return {
            guestId: payload.guestId,
            filename: files[index].originalname,
            originalImageUrl: url,
            trackingId: payload.trackingId,
          };
        });
        uploadImages = await imageRepository.bulkUploadImage(imageDocs);
      }
      if (!uploadImages) {
        throw new AppError(
          Messages.ERROR_UPLOADING_IMAGE,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      return uploadImages;
    } catch (error) {
      console.log(error);
      throw new AppError(
        Messages.ERROR_UPLOADING_IMAGE,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async compressImage(
    params: any,
    payload: any,
    userId?: mongoose.Types.ObjectId
  ) {
    try {
      const { imageId } = params;
      if (!imageId) {
        throw new AppError(Messages.IMAGE_ID_REQUIRED, HTTP_STATUS.NOT_FOUND);
      }
      let findImage;
      if (userId) {
        findImage = await imageRepository.findImage(userId, imageId);
      } else {
        findImage = await imageRepository.findImageById(imageId);
      }
      if (!findImage) {
        throw new AppError(Messages.IMAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      const response = await axios.get(findImage.originalImageUrl, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data);
      const channel = await getRabbitChannel();
      channel.sendToQueue(
        "compress",
        Buffer.from(
          JSON.stringify({
            imageId: findImage._id,
            image: buffer,
            originalImageUrl: findImage.originalImageUrl,
            userId: userId ? userId : payload.guestId,
            fileName: findImage.filename,
            compressionValue: payload.compressionValue ?? 50,
          })
        )
      );
    } catch (error) {
      console.log(error);
      throw new AppError(
        Messages.ERROR_COMPRESSING_IMAGE,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
export default new ImageService();
