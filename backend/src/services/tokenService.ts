import tokenRepository from "../repositories/tokenRepository";
import HTTP_STATUS from "../constants/statusCode";
import AppError from "../utils/AppError";
import { Messages } from "../utils/messages";
import jwt, { JwtPayload } from "jsonwebtoken";
import userRepository from "../repositories/userRepository";
import { generateToken } from "../utils/common";
import dotenv from "dotenv";
import { Types } from "mongoose";
dotenv.config();

class TokenService {
  public async getAccessToken(payload: {
    refreshToken: string;
  }): Promise<string> {
    const { refreshToken: currentRefreshToken } = payload;
    if (!currentRefreshToken) {
      throw new AppError(Messages.BAD_REQUEST, HTTP_STATUS.BAD_REQUEST);
    }
    const findToken = await tokenRepository.findUserByRefreshToken(
      currentRefreshToken
    );
    if (!findToken) {
      throw new AppError(Messages.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new AppError(
        Messages.SERVER_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    const decoded = jwt.verify(
      currentRefreshToken,
      process.env.JWT_ACCESS_SECRET
    ) as JwtPayload;
    if (!decoded) {
      throw new AppError(
        Messages.TOKEN_EXPIRED_OR_INVALID,
        HTTP_STATUS.FORBIDDEN
      );
    }
    const findUser = await userRepository.findUserById(decoded.id);
    if (!findUser) {
      throw new AppError(Messages.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    const { refreshToken, accessToken } = await generateToken(findUser);
    const updateToken = await tokenRepository.updateToken(
      findUser._id as Types.ObjectId,
      refreshToken
    );
    if (!updateToken) {
      throw new AppError(Messages.TOKEN_NOT_UPDATED, HTTP_STATUS.BAD_REQUEST);
    }
    return accessToken;
  }
}
export default new TokenService();
