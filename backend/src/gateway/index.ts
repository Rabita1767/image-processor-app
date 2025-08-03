import { Socket } from "socket.io";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary";
import imageRepository from "../repositories/imageRepository";
import { getRabbitChannel } from "../config/rabbitMq";
import uploadToCloudinaryFromBuffer from "../utils/cloudinary";

const socketGateway = async (socket: Socket) => {
  const users: any = {};

  console.log("New client connected", socket.id);
  socket.on("authentication", async (data) => {
    console.log("User uploaded data", data);
    users[data?.userId] = socket.id;
    socket.join(data?.userId);
    console.log("User joined room", data?.userId);
    console.log("Current users map:", users);
    if (!data?.imageBuffer) {
      socket.emit("upload-error", {
        error: "Image buffer is required",
      });
      return;
    }
    try {
      const originalUrl = await uploadToCloudinaryFromBuffer(
        data?.imageBuffer,
        data?.fileName
      );
      const uploadImage = await imageRepository.uploadImageAsGuest(
        data,
        originalUrl
      );
      if (!uploadImage) {
        console.error("Error saving image to database");
        return socket.emit("upload-error", { error: "Failed to save image" });
      }
      socket.emit("upload-success", {
        message: "Image uploaded successfully",
        imageId: uploadImage._id,
        originalImageUrl: uploadImage.originalImageUrl,
        fileName: uploadImage.filename,
      });
      const channel = await getRabbitChannel();
      channel.sendToQueue(
        "compress",
        Buffer.from(
          JSON.stringify({
            imageId: uploadImage._id,
            image: uploadImage.originalImageUrl,
            userId: data.userId,
            fileName: uploadImage.filename,
          })
        )
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      return socket.emit("upload-error", { error: "Failed to upload image" });
    }
  });

  socket.on("hello", (data) => {
    console.log("helloooo", data);
  });

  socket.on("disconnect", () => {
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log("User disconnected", userId);
        break;
      }
    }
  });
};
export default socketGateway;
