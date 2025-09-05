import { Socket } from "socket.io";
import imageRepository from "../repositories/imageRepository";
import { getRabbitChannel } from "../config/rabbitMq";
import uploadToCloudinaryFromBuffer from "../utils/cloudinary";
import mongoose, { mongo } from "mongoose";

const socketGateway = async (socket: Socket) => {
  const userId = socket.handshake.query.userId || "";
  const token = socket.handshake.auth.token || "";
  socket.join(userId);
  const users: any = {};
  socket.emit("hello", {
    message: "Hello from the server!",
    socketId: socket.id,
  });
  socket.on("startCompression", async (data) => {
    const findUploadedImage = await imageRepository.findImageById(
      data?.uploadedFileId
    );
    if (!findUploadedImage) {
      return socket.emit("upload-error", { error: "Failed to find image" });
    }
    const base64Data = data?.base64Image.replace(
      /^data:image\/\w+;base64,/,
      ""
    );
    const buffer = Buffer.from(base64Data, "base64");
    const channel = await getRabbitChannel();
    channel.sendToQueue(
      "compress",
      Buffer.from(
        JSON.stringify({
          imageId: findUploadedImage._id,
          image: buffer,
          originalImageUrl: data.originalUrl,
          userId: userId,
          fileName: findUploadedImage.filename,
          compressionValue: data.compressionValue,
        })
      )
    );
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
