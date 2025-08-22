import mongoose, {
  Document,
  MongooseDistinctDocumentMiddleware,
  Types,
} from "mongoose";
import { Request } from "express";
export interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
}

export interface IImage extends Document {
  user: Types.ObjectId;
  guestId?: string;
  filename: string;
  originalImageUrl: string;
  processedImageUrl?: string;
  status: "pending" | "processing" | "done" | "failed";
}

export interface ApiResponse extends Document {
  success: boolean;
  data: any;
  message?: string;
  error?: any;
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
export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
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
