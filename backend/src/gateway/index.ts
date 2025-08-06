import { Socket } from "socket.io";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary";
import imageRepository from "../repositories/imageRepository";
import { getRabbitChannel } from "../config/rabbitMq";
import uploadToCloudinaryFromBuffer from "../utils/cloudinary";

const socketGateway = async (socket: Socket) => {
  const userId = socket.handshake.query.userId || "";
  console.log("guuuuu", userId);
  // socket.join(userId);
  const users: any = {};

  console.log("New client connected", socket.id);

  socket.on("authentication", async (data) => {
    try {
      socket.join(userId);
      console.log("User uploaded data", data);
      const base64Data = data?.base64Image.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const buffer = Buffer.from(base64Data, "base64");

      const originalUrl = await uploadToCloudinaryFromBuffer(
        buffer,
        data.fileName || "uploaded_image"
      );
      const uploadImage = await imageRepository.uploadImageAsGuest(
        userId as string,
        data?.fileName,
        originalUrl
      );
      if (!uploadImage) {
        console.error("Error saving image to database");
        return socket.emit("upload-error", { error: "Failed to save image" });
      }

      socket.emit("upload-success", {
        message: "Image uploaded successfully",
        imageUrl: originalUrl,
      });
      const channel = await getRabbitChannel();
      channel.sendToQueue(
        "compress",
        Buffer.from(
          JSON.stringify({
            imageId: uploadImage._id,
            image: buffer,
            originalImageUrl: originalUrl,
            userId: userId,
            fileName: uploadImage.filename,
          })
        )
      );
    } catch (err) {
      console.error("Error uploading image:", err);
      socket.emit("upload-error", { error: err.message });
    }
  });

  socket.emit("hello", {
    message: "Hello from the server!",
    socketId: socket.id,
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
