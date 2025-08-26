import mongoose, { Document, Types } from "mongoose";
import { Request } from "express";
export interface IUser {
  _id: mongoose.Types.ObjectId;
  userName: string;
  email: string;
  password: string;
}
export interface IError {
  errors: {
    type: string;
    value: string;
    msg: string;
    path: string;
    location: string;
  }[];
}
export interface IImage {
  _id: mongoose.Types.ObjectId;
  user?: Types.ObjectId;
  guestId?: string;
  trackingId: string;
  filename: string;
  originalImageUrl: string;
  processedImageUrl?: string;
  status: "pending" | "processing" | "done" | "failed";
}

export interface ApiResponse extends Document {
  success: boolean;
  result: any;
  message?: string;
  error?: IError | null;
}

export interface IToken {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenPayload {
  id: string;
  userName: string;
  email: string;
}

export interface IloginPayload {
  email: string;
  password: string;
}

export type safeUser = Omit<IUser, "password">;
export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: safeUser;
}

export interface CustomRequest extends Request {
  userId?: mongoose.Types.ObjectId;
}
export interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}
export interface IImagePayload {
  file: IFile;
}

interface ErrorWithStatus extends Error {
  status?: number;
}
export interface IUploadPayload {
  guestId?: string;
  trackingId: string;
}
