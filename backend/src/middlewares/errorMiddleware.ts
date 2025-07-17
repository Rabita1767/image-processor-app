import {NextFunction, Request,Response} from "express";
import HTTP_STATUS from "../constants/statusCode";
import { sendResponse } from "../utils/common";
export const errorHandler=(error:any,req:Request,res:Response,next:NextFunction)=>{
console.log(error);
const statusCode=error.statusCode ?? 500;
const message=error.message ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
return sendResponse(res,statusCode,message);

}
