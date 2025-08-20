import { NextFunction, Request, Response } from "express";
import HTTP_STATUS from "../constants/statusCode";
import { sendResponse } from "../utils/common";
import AppError from "../utils/AppError";

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(error);

  const statusCode = error.statusCode ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error.message ?? "Internal Server Error";

  if (error instanceof AppError && error.details) {
    return sendResponse(res, statusCode, message, {
      errors: error.details,
    });
  }

  return sendResponse(res, statusCode, message);
};
