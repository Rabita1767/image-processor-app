import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRoute from "./routes/userRoute";
import imageRoute from "./routes/imageRoute";
import { errorHandler } from "./middlewares/errorMiddleware";

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

io.on("connection",(socket)=>{
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId); 
    console.log(`Socket joined room: ${userId}`);
  }
  console.log("User is connected",socket.id);
  socket.on("disconnect",()=>{
    console.log('User is disconnected',socket.id);
  })
})
  

export { server, io };
