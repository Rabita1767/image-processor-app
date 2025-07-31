import { io } from "socket.io-client";

let socket:any;

export const getSocket=(userId:string)=>{
    if(!socket &&  typeof window!==undefined)
    {
        socket=io(`${process.env.NEXT_PUBLIC_BASE_URL}`, {
            autoConnect: false,
            transports: ["websocket"],
            query: { userId },
        });
    }
    
    return socket;
}