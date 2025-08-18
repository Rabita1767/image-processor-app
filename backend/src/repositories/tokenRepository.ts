import mongoose, { Document, Types } from "mongoose";
import tokenModel from "../models/tokenModel";
class TokenRepository {
  public async findUserByRefreshToken(refreshToken: string) {
    return await tokenModel.findOne({ refreshToken: refreshToken });
  }
  public async updateToken(
    userId: mongoose.Types.ObjectId,
    refreshToken: string
  ) {
    return await tokenModel.findOneAndUpdate(
      { userId: userId },
      { refreshToken: refreshToken, createdAt: new Date() },
      { new: true, upsert: true }
    );
  }
}
export default new TokenRepository();
