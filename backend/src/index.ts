import dotenv from "dotenv";
import databaseConnection from "./config/database";
import { rabbitMqConnection } from "./config/rabbitMq";
import {server} from "./server";


dotenv.config();
export const startServer=async ()=>{
    
    const PORT=process.env.PORT ?? 8000;
    try {
        await rabbitMqConnection();
        console.log("RabbitMQ connected");
        databaseConnection(()=>{
            server.listen(PORT,()=>{
                console.log(`Server is running on port ${PORT}`);
            }
            );
        })
        
    } catch (error) {
        console.error("Error starting the server", error);
        process.exit(1);
    }
}


