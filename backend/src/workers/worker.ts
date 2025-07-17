import amqp from "amqplib";
import path from "path";
import sharp from "sharp";
import dotenv from "dotenv";
import databaseConnection from "../config/database";
import imageRepository from "../repositories/imageRepository";
dotenv.config();
const consumeQueue=async()=>{
const connection=await amqp.connect(process.env.RABBITMQ_URL as string);
const channel=await connection.createChannel();
channel.assertQueue("compress");

channel.consume("compress",async(msg)=>{
    if(msg)
    {
        const {imgId,path:inputPath}=JSON.parse(msg.content.toString());
        const ext=path.extname(inputPath);
        const outputPath=inputPath.replace(ext,`compressed{ext}`); 
        try {
            await sharp(inputPath).jpeg({quality:60}).toFile(outputPath);
            const updateImage= await imageRepository.findByIdAndUpdate(imgId,outputPath);
            if(!updateImage)
            {
                throw new Error("Image not found");
            }
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