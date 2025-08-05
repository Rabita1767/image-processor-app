import amqp from "amqplib";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import dotenv from "dotenv";
import databaseConnection from "../config/database";
import imageRepository from "../repositories/imageRepository";
import { Server } from "socket.io";
import uploadToCloudinaryFromBuffer from "../utils/cloudinary";

dotenv.config();

const compressAndUpload = async (
  buffer: ArrayBuffer,
  filename: string
): Promise<string> => {
  const compressedDir = path.join(__dirname, "..", "..", "compressed");
  if (!fs.existsSync(compressedDir)) {
    fs.mkdirSync(compressedDir, { recursive: true });
  }
  const compressedBuffer = await sharp(buffer)
    .resize({ width: 800 }) // example: resize width to 800px
    .jpeg({ quality: 70 }) // compress to 70% quality
    .toBuffer();
  const uploadedURL = uploadToCloudinaryFromBuffer(compressedBuffer, filename);
  return uploadedURL;
};

export const consumeQueue = async (io: Server) => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
  const channel = await connection.createChannel();
  channel.assertQueue("compress");

  channel.consume("compress", async (msg) => {
    let consumerStarted = false;
    if (consumerStarted) return;
    if (!msg) return;
    const { imageId, image, fileName, userId } = JSON.parse(
      msg.content.toString()
    );
    const buffer = Buffer.from(image, "base64");
    try {
      console.log("hjhjhkjhkh", { imageId, image, fileName, userId });
      if (!fileName) {
        console.error("Filename is missing in the message");
        return;
      }
      console.log("jkljrklegjrlkjrlkjflr", buffer);
      const outputPath = await compressAndUpload(buffer.buffer, fileName);
      const updateImage = await imageRepository.findByIdAndUpdate(
        imageId,
        outputPath
      );
      if (!updateImage) {
        throw new Error("Image not found");
      }
        io.emit("notification", {
          message: "Image compressed successfully",
          imageId: "123",
          compressedImageUrl: outputPath,
        });
      

      console.log("Image processed and saved at:", outputPath);
      channel.ack(msg);
    } catch (error) {
      console.error("Error processing image:", error);
      //   channel.nack(msg);
    }
    consumerStarted = true;
  });
  console.log("Waiting for messages in the queue...");
};
