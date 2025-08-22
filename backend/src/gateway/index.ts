import { Socket } from "socket.io";
import imageRepository from "../repositories/imageRepository";
import { getRabbitChannel } from "../config/rabbitMq";
import uploadToCloudinaryFromBuffer from "../utils/cloudinary";
import mongoose, { mongo } from "mongoose";

const socketGateway = async (socket: Socket) => {
  const userId = socket.handshake.query.userId || "";
  const token = socket.handshake.auth.token || "";
  const users: any = {};
  console.log("tokkkeeeeeeen", token);
  console.log("userId", userId);
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
      let uploadImage;
      if (!token) {
        uploadImage = await imageRepository.uploadImageAsGuest(
          userId as string,
          data?.fileName,
          originalUrl
        );
      } else {
        uploadImage = await imageRepository.uploadImageAsUser(
          userId as string,
          data?.fileName,
          originalUrl
        );
      }
      if (!uploadImage) {
        console.error("Error saving image to database");
        return socket.emit("upload-error", { error: "Failed to save image" });
      }

      socket.emit("upload-success", {
        message: "Image uploaded successfully",
        imageUrl: originalUrl,
        uploadedImgId: uploadImage._id,
      });
      // const channel = await getRabbitChannel();
      // channel.sendToQueue(
      //   "compress",
      //   Buffer.from(
      //     JSON.stringify({
      //       imageId: uploadImage._id,
      //       image: buffer,
      //       originalImageUrl: originalUrl,
      //       userId: userId,
      //       fileName: uploadImage.filename,
      //     })
      //   )
      // );
      // socket.on("new-test", async (data) => {
      //   console.log("gotcha", data);
      //   if (!data) return;
      //   const channel = await getRabbitChannel();
      //   channel.sendToQueue(
      //     "compress",
      //     Buffer.from(
      //       JSON.stringify({
      //         imageId: uploadImage._id,
      //         image: buffer,
      //         originalImageUrl: originalUrl,
      //         userId: userId,
      //         fileName: uploadImage.filename,
      //       })
      //     )
      //   );
      // });
    } catch (err) {
      console.error("Error uploading image:", err);
      socket.emit("upload-error", { error: err.message });
    }
  });

  socket.emit("hello", {
    message: "Hello from the server!",
    socketId: socket.id,
  });
  socket.on("new-test", async (data) => {
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
