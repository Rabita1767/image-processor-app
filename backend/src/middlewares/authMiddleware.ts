import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/common";
import HTTP_STATUS from "../constants/statusCode";
import { Messages } from "../utils/messages";
import { ITokenPayload } from "../types";

export interface CustomRequest extends Request {
  userId?: string | string[];
  guestUser?: boolean;
}

class AuthMiddleware {
  auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      let accessToken = req.headers.authorization;
      let token = accessToken?.split(" ")[1];
      if (!token) {
        return next();
      }
      // Verify token
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string
      ) as ITokenPayload;
      if (!decodedToken) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          Messages.UNAUTHORIZED
        );
      }
      req.userId = decodedToken.id;
      next();
    } catch (error) {
      console.log(error);
      if (error instanceof jwt.JsonWebTokenError) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Token Invalid");
      }
      if (error instanceof jwt.TokenExpiredError) {
        return sendResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          Messages.UNAUTHORIZED
        );
      }
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        Messages.INTERNAL_SERVER_ERROR
      );
    }
  };
}
export default new AuthMiddleware();
