import { getRabbitChannel } from "../config/rabbitMq";
import HTTP_STATUS from "../constants/statusCode";
import imageRepository from "../repositories/imageRepository";
import {  IImage, IFile} from "../types";
import AppError from "../utils/AppError";
import { Messages } from "../utils/messages";
import fs from "fs";

 class ImageService {
    public async uploadImage(userId:string | undefined,payload:IFile | undefined):Promise<IImage>{
            if(!payload)
            {
                throw new AppError(Messages.FILE_NOT_FOUND,HTTP_STATUS.BAD_REQUEST);
            }
            const uploadedImage=await imageRepository.uploadImage(userId,payload);
            if(!uploadedImage)
            {
                throw new AppError(Messages.IMAGE_NOT_UPLOADED,HTTP_STATUS.BAD_REQUEST);
            }
            return uploadedImage;
    }

    public async compressImage(params: { id: string }): Promise<string | null> {
        try {
            const { id } = params;
            if(!id)
            {
                throw new Error(Messages.INVALID_PARAMETERS);
            }
            const findImageById = await imageRepository.findImageById(id);
            if (!findImageById) {
                throw new Error(Messages.IMAGE_NOT_FOUND);
            }
            const channel = await getRabbitChannel();
            channel.sendToQueue("compress", Buffer.from(JSON.stringify({
                imgId: id,
                path: findImageById.originalPath,
            })));
            console.log("Message sent to queue");
            return id;

        } catch (error) {
            console.log(error);
            throw new Error(Messages.ERROR_COMPRESSING_IMAGE);
        }
    }

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

    private async uploadAndCompressAsGuest(payload:IFile | undefined):Promise<string>{
       try {
        if(!payload)
        {
            throw new AppError(Messages.FILE_NOT_FOUND,HTTP_STATUS.BAD_REQUEST);
        }
        const uploadImageAsGuest=await imageRepository.uploadImageAsGuest(payload);
        if(!uploadImageAsGuest)
        {
            throw new AppError(Messages.IMAGE_NOT_UPLOADED,HTTP_STATUS.BAD_REQUEST);
        }
        const channel= await getRabbitChannel();
        const filePath = payload.path;
        const imageBuffer = fs.readFileSync(filePath);
        channel.sendToQueue("compress",Buffer.from(JSON.stringify({
            imageId: uploadImageAsGuest._id,
            image:imageBuffer.toString('base64'),
            userId:"guest",
            fileName: payload.filename,
        })))
        console.log("Message sent to queue");
        return payload.path;
       } catch (error) {
            console.log(error);
            throw new AppError(Messages.ERROR_UPLOADING_IMAGE,HTTP_STATUS.BAD_REQUEST);
       }

    }

    public async uploadAndCompress(userId:string | undefined,payload:IFile | undefined):Promise<any>{
        if(!userId)
        {
            console.log("payloaddddd",payload);
        }
        else {
            console.log("userId",userId);
        }
    }

}
export default new ImageService;