import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

const uploadToCloudinaryFromBuffer = (
  buffer: Buffer,
  filename: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "socket_uploads",
        public_id: filename.split(".")[0], // Optional: name without extension
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            error || new Error("No result returned from Cloudinary")
          );
        }
        resolve(result.secure_url); // ✅ This is what you use on frontend
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export default uploadToCloudinaryFromBuffer;
