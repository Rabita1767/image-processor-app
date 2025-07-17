import { model, Schema } from "mongoose";

const tokenSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d", // Token will expire after 7 days
  },
});

export default model("Token", tokenSchema);
