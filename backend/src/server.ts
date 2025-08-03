import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRoute from "./routes/userRoute";
import imageRoute from "./routes/imageRoute";
import { errorHandler } from "./middlewares/errorMiddleware";
import socketGateway from "./gateway/index";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors({ origin: "*" })); // Allow all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/user", userRoute);
app.use("/api/v1/image", imageRoute);

// Error Handling Middleware
app.use(errorHandler);

io.on("connection", socketGateway);

// const notificationQueue: Record<string, any[]> = {};

// function sendNotification(userId: string, data: any) {
//   console.log("userssssssss",users);
//   if (users[userId]) {
//     io.to(users[userId]).emit("notification", data);
//     console.log("Notification sent to user", userId);
//   } else {
//     // Queue it until user connects
//     if (!notificationQueue[userId]) notificationQueue[userId] = [];
//     notificationQueue[userId].push(data);
//     console.log("Notification queued for user", userId);
//   }
// }
// setInterval(()=>{
//   console.log("userrrrrrrrr",users)
// },5000)

export { server, io };
