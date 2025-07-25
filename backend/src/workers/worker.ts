import amqp from "amqplib";
import path from "path";
import sharp from "sharp";
import dotenv from "dotenv";
import databaseConnection from "../config/database";
import imageRepository from "../repositories/imageRepository";
import {io} from "../server";
dotenv.config();

const compressAndSave=async(buffer:ArrayBuffer,filename:string):Promise<string>=>{
    const outputPath = path.join('compressed', filename);
    await sharp(buffer)
    .resize({ width: 800 }) // example: resize width to 800px
    .jpeg({ quality: 70 })  // compress to 70% quality
    .toFile(outputPath);
  return outputPath;

}
const consumeQueue=async()=>{
const connection=await amqp.connect(process.env.RABBITMQ_URL as string);
const channel=await connection.createChannel();
channel.assertQueue("compress");

channel.consume("compress",async(msg)=>{
    if(msg)
    {
        const { imageId,image, filename, userId } = JSON.parse(msg.content.toString());
        const buffer = Buffer.from(image, 'base64');
        try {
            const outputPath=await compressAndSave(buffer.buffer,filename);
            const updateImage= await imageRepository.findByIdAndUpdate(imageId,outputPath);
            if(!updateImage)
            {
                throw new Error("Image not found");
            }
            io.to(userId).emit("image-compressed",{
                imageId,
                outputPath
            })
            console.log("Image processed and saved at:", outputPath);
            channel.ack(msg) 
        } catch (error) {
            console.error("Error processing image:", error);
            channel.nack(msg);
        }
    }
})
console.log("Waiting for messages in the queue...");

}

databaseConnection(()=>{
    console.log("Database connected");
    consumeQueue();
})