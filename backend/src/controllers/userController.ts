import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/common";
import HTTP_STATUS from "../constants/statusCode";
import { Messages } from "../utils/messages";
import userService from "../services/userService";

class UserController {
  public async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const signup = await userService.signup(req.body);
      return sendResponse(res, HTTP_STATUS.CREATED, Messages.CREATED, signup);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const login = await userService.login(req.body);
      res.cookie("refreshToken", login.refreshToken, {
        httpOnly: true,
        secure: false, // false for localhost; true for production (HTTPS)
        sameSite: "lax", // allows cookies on same site or top-level navigation
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/", // ensure cookie is sent to all routes
      });

      return sendResponse(res, HTTP_STATUS.OK, Messages.CREATED, login);
    } catch (error) {
      next(error);
    }
  }
}
export default new UserController();
