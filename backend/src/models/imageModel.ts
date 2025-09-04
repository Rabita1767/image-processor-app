import { Schema, model } from "mongoose";
import { IImage } from "../types";

const imageSchema = new Schema<IImage>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    guestId: { type: String },
    trackingId: { type: String, required: true },
    filename: { type: String, required: true },
    originalImageUrl: { type: String },
    processedImageUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "uploaded", "processing", "done", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default model<IImage>("Image", imageSchema);
