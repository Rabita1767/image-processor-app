import { Request, Response, NextFunction } from "express";
import tokenService from "../services/tokenService";
import { sendResponse } from "../utils/common";
import HTTP_STATUS from "../constants/statusCode";
import { Messages } from "../utils/messages";
class TokenController {
  public async getAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const accessToken = await tokenService.getAccessToken(req.body);
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        Messages.TOKEN_GENERATED,
        accessToken
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
export default new TokenController();
