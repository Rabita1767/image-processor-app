import { Schema, model  } from "mongoose";
import { IImage } from "../types";

const imageSchema = new Schema<IImage>({
  user:         { type: Schema.Types.ObjectId , ref: "User" },
  guestId:      {type:String},
  filename:     { type: String, required: true },
  originalPath: { type: String, required: true },
  processedPath:{ type: String },
  status:       { type: String, enum: ["pending", "processing", "done", "failed"], default: "pending" },
}, {
  timestamps: true
});

export default model<IImage>("Image", imageSchema);
