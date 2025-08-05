import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
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
  maxHttpBufferSize: 5e6,
});

const pubClient = new Redis();
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

io.on("connection", socketGateway);

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/user", userRoute);
app.use("/api/v1/image", imageRoute);
app.use(errorHandler);

export { server, io };
