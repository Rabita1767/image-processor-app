import { Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import TokenModel from "../models/tokenModel";
import { ApiResponse, IToken, IUser } from "../types";
import { Messages } from "./messages";
dotenv.config();

export const sendResponse = (
  res: Response,
  status: number,
  message: string,
  result: any = null
): void => {
  const response: Partial<ApiResponse> = {
    success: status < 400,
    message: message,
    data: result,
    error: null,
  } as ApiResponse;
  if (status >= 400) {
    response.success = false;
    response.error = result;
    response.message = "Internal server error";
  } else {
    response.success = true;
    response.data = result;
    response.message = "Successfully completed operations";
  }

  if (message) {
    response.message = message;
  }
  res.status(status).send(response);
};

export const generateToken = async (tokenData: any): Promise<IToken> => {
  try {
    const accessToken =  jwt.sign(
      {
        id: tokenData._id,
        name: tokenData.userName ?? "guest",
        email: tokenData.email ?? "guest@gmail.com",
      },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "1h" }
    );
    const refreshToken =  jwt.sign(
      {
        id: tokenData._id,
        name: tokenData.userName ?? "guest",
        email: tokenData.email ?? "guest@gmail.com",
      },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "7d" }
    );
    // Save refresh token to database
    const findToken = await TokenModel.findOne({ userId: tokenData._id });
    if (!findToken) {
      const createToken = await TokenModel.create({
        userId: tokenData._id,
        refreshToken: refreshToken,
      });
      await createToken.save();
    } else {
      findToken.refreshToken = refreshToken;
      findToken.createdAt = new Date();
      await findToken.save();
    }
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(Messages.ERROR_GENERATING_TOKEN, error);
    throw new Error(Messages.TOKEN_GENERATION_FAILED);
  }
};
