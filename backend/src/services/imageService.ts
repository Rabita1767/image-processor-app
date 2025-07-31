import { getRabbitChannel } from "../config/rabbitMq";
import HTTP_STATUS from "../constants/statusCode";
import imageRepository from "../repositories/imageRepository";
import {  IImage, IFile} from "../types";
import AppError from "../utils/AppError";
import { generateToken } from "../utils/common";
import { Messages } from "../utils/messages";
import fs from "fs";
import mongoose from "mongoose";
import { consumeQueue } from "../workers/worker";

 class ImageService {
    
    public async downloadProcessedImage(params:{id:string}):Promise<string>{
        try {
            const {id}=params;
            const findImageById=await imageRepository.findImageById(id);
            if(!findImageById)
            {
                throw new Error(Messages.IMAGE_NOT_FOUND);
            }
            const filePath=findImageById.processedPath;
            if(!filePath || findImageById.status!=="done")
            {
                throw new Error(Messages.IMAGE_NOT_COMPRESSED);
            }
            return filePath;     
        } catch (error) {
            console.log(error);
            throw new Error(Messages.ERROR_DOWNLOADING_IMAGE);
            
        }
    }

    public async getImageById(params:{id:string}):Promise<IImage | null>{
        try {
            const {id}=params;
            if(!id)
            {
                throw new Error(Messages.INVALID_PARAMETERS);
            }
            const findImageById=await imageRepository.findImageById(id);
            if(!findImageById)
            {
                throw new Error(Messages.IMAGE_NOT_FOUND);
            }
            return findImageById;      
        } catch (error) {
            console.log(error);
            throw new Error(Messages.IMAGE_NOT_FOUND);
            
        }
    }

    public async uploadAndCompressAsGuest(userId:String |undefined,payload:IFile | undefined):Promise<any>{
        try {
         console.log("hhwjgdwjhqdjwhd",userId);
         if(!payload)
         {
             throw new AppError(Messages.FILE_NOT_FOUND,HTTP_STATUS.BAD_REQUEST);
         }
         const uploadImage=await imageRepository.uploadImageAsGuest(userId,payload);
         if(!uploadImage)
         {
             throw new AppError(Messages.IMAGE_NOT_UPLOADED,HTTP_STATUS.BAD_REQUEST);
         }
         // const userTokenData={
         //     _id:uploadImage.user,
         //     userName:"guest",
         //     email:"guest@gmail.com",
         // }
         // const { accessToken, refreshToken } = await generateToken(userTokenData);
         const channel= await getRabbitChannel();
         const filePath = payload.path;
         const imageBuffer = fs.readFileSync(filePath);
         channel.sendToQueue("compress",Buffer.from(JSON.stringify({
             imageId: uploadImage._id,
             image:imageBuffer.toString('base64'),
             userId:uploadImage.guestId,
             fileName: uploadImage.filename,
         })))
         console.log("Message sent to queue");
         return {
             guestId:uploadImage.guestId,
             originalImage: payload.path,
             // accessToken: accessToken,
             // refreshToken: refreshToken,
         };
        } catch (error) {
             console.log(error);
             throw new AppError(Messages.ERROR_UPLOADING_IMAGE,HTTP_STATUS.BAD_REQUEST);
        }
 
     }
    public async uploadAndCompress(userId:mongoose.Types.ObjectId | undefined,payload:IFile | undefined):Promise<string>{
        try {
         if(!payload)
         {
             throw new AppError(Messages.FILE_NOT_FOUND,HTTP_STATUS.BAD_REQUEST);
         }
         if(!userId)
         {
             const customUserId = new mongoose.Types.ObjectId();
             userId = customUserId;
             console.log("User ID:", userId);
         }
         const uploadImage=await imageRepository.uploadImage(userId,payload);
         if(!uploadImage)
         {
             throw new AppError(Messages.IMAGE_NOT_UPLOADED,HTTP_STATUS.BAD_REQUEST);
         }
         const channel= await getRabbitChannel();
         const filePath = payload.path;
         const imageBuffer = fs.readFileSync(filePath);
         channel.sendToQueue("compress",Buffer.from(JSON.stringify({
             imageId: uploadImage._id,
             image:imageBuffer.toString('base64'),
             userId:uploadImage.user,
             fileName: uploadImage.filename,
         })))
         console.log("Message sent to queue");
         return payload.path;
        } catch (error) {
             console.log(error);
             throw new AppError(Messages.ERROR_UPLOADING_IMAGE,HTTP_STATUS.BAD_REQUEST);
        }
 
     }
}
export default new ImageService;