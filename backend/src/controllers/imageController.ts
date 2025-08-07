import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/common";
import HTTP_STATUS from "../constants/statusCode";
import { Messages } from "../utils/messages";
import imageService from "../services/imageService";
import { CustomRequest } from "../types";
class ImageController {
  public async downloadProcessedImage(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const response = await imageService.downloadProcessedImage(
        req.params as { url: string }
      );
      const contentType =
        response.headers.get("content-type") || "application/octet-stream";
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=compressed-image.jpg"
      );
      res.setHeader("Content-Type", contentType);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (error) {
      console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        Messages.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  public async getImageById(req: Request, res: Response): Promise<void> {
    try {
      const getImageById = await imageService.getImageById(
        req.params as { id: string }
      );
      return sendResponse(
        res,
        HTTP_STATUS.OK,
        Messages.IMAGE_STATUS_FETCHED_SUCCESSFULLY,
        getImageById
      );
    } catch (error) {
      console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        Messages.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  // public async compressImageUpdatedAsGuest(req:CustomRequest,res:Response,next:NextFunction):Promise<void>{
  //     try{
  //         console.log("Compressing and uploading image as Guest");
  //         const uploadAndCompress= await imageService.uploadAndCompressAsGuest(req.userId,req.file);
  //         return sendResponse(res,HTTP_STATUS.CREATED,Messages.IMAGE_UPLOADED_AND_COMPRESSED_SUCCESSFULLY,uploadAndCompress);
  //     }
  //     catch(error){
  //         console.log(error);
  //         next(error);
  //     }
  // }
}
export default new ImageController();
