import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import AppError from "../../utils/AppError";

export const validateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", 400, errors.array());
  }

  next();
};
