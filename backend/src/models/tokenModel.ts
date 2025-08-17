import mongoose, { model, Schema } from "mongoose";

const tokenSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User", // Reference to the User model
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
