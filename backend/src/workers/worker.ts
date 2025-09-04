import amqp from "amqplib";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import dotenv from "dotenv";
import databaseConnection from "../config/database";
import imageRepository from "../repositories/imageRepository";
import { Server } from "socket.io";
import uploadToCloudinaryFromBuffer from "../utils/cloudinary";
import AppError from "../utils/AppError";
import { Messages } from "../utils/messages";

dotenv.config();

const compressAndUpload = async (
  buffer: ArrayBuffer,
  filename: string,
  compressionValue: number
): Promise<string> => {
  const compressedBuffer = await sharp(buffer)
    .resize({ width: 800 }) // example: resize width to 800px
    .jpeg({ quality: compressionValue })
    .toBuffer();
  const uploadedURL = uploadToCloudinaryFromBuffer(compressedBuffer, filename);
  return uploadedURL;
};

export const consumeQueue = async (io: Server) => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
  const channel = await connection.createChannel();
  channel.assertQueue("compress");
  channel.assertQueue("upload");
  channel.assertQueue("bulkUpload");
  channel.consume("compress", async (msg) => {
    let consumerStarted = false;
    if (consumerStarted) return;
    if (!msg) return;
    const {
      imageId,
      image,
      fileName,
      userId,
      originalImageUrl,
      compressionValue,
    } = JSON.parse(msg.content.toString());
    const buffer = Buffer.from(image, "base64");
    try {
      if (!fileName) {
        console.error("Filename is missing in the message");
        return;
      }
      const outputPath = await compressAndUpload(
        buffer.buffer,
        fileName,
        compressionValue
      );
      const updateImage = await imageRepository.findByIdAndUpdate(
        imageId,
        outputPath
      );
      if (!updateImage) {
        throw new Error("Image not found");
      }
      io.to(userId).emit("notification", {
        message: "Image compressed successfully",
        imageId: imageId,
        fileName: fileName,
        originalImageUrl: originalImageUrl,
        compressedImageUrl: outputPath,
      });

      channel.ack(msg);
    } catch (error) {
      console.error("Error processing image:", error);
      //   channel.nack(msg);
    }
    consumerStarted = true;
  });

  channel.consume("upload", async (msg) => {
    if (!msg) return;
    const { userId, imageId, imageBuffer, originalname } = JSON.parse(
      msg.content.toString()
    );
    try {
      if (!originalname) {
        console.error("Filename is missing in the message");
        return;
      }
      console.log("uyyyyyy", { userId, imageId, imageBuffer, originalname });
      const buffer = Buffer.from(imageBuffer, "base64");
      const originalImageUrl = await uploadToCloudinaryFromBuffer(
        buffer,
        originalname
      );
      const updateImage = await imageRepository.findByIdAndUpdateUpload(
        imageId,
        originalImageUrl
      );
      if (!updateImage) {
        throw new AppError(Messages.IMAGE_NOT_FOUND, 404);
      }

      io.to(userId).emit("uploadSuccess", {
        message: "Image uploaded successfully",
        originalImageUrl: originalImageUrl,
        originalname: originalname,
        trackingId: updateImage.trackingId,
        imageId: imageId,
      });

      channel.ack(msg);
    } catch (error) {
      console.error("Error uploading image:", error);
      //   channel.nack(msg);
    }
  });
  
  console.log("Waiting for messages in the queue...");
};
