import ImageModel from "../models/imageModel";
import { IFile, IImage } from "../types";
class ImageRepository {
    public async uploadImage(userId:string | undefined,payload:IFile):Promise<IImage> {
        return await ImageModel.create({
            user:userId,
            filename:payload.filename,
            originalPath:payload.path
        })
    }

    public async uploadImageAsGuest(payload:IFile):Promise<IImage> {
        return await ImageModel.create({
            user:"guest",
            filename:payload.filename,
            originalPath:payload.path
        })
    }

    public async findImageById(id:string):Promise<IImage | null>{
        return await ImageModel.findById({_id:id});
    }

    public async findByIdAndUpdate(imgId:string,outputPath:string):Promise<IImage | null>{
        return await ImageModel.findByIdAndUpdate(imgId,{
            processedPath:outputPath,
            status:"done"
        },{new:true})
    }

}
export default new ImageRepository;