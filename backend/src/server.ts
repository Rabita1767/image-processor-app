import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import userRoute from "./routes/userRoute";
import imageRoute from "./routes/imageRoute";
import tokenRoute from "./routes/tokenRoute";
import { errorHandler } from "./middlewares/errorMiddleware";
import socketGateway from "./gateway/index";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 5e6,
});

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

const pubClient = new Redis(REDIS_URL, {
  tls: {
    rejectUnauthorized: false, // allow Upstash SSL
  },
});
const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.error("Redis Pub Client Error:", err));
subClient.on("error", (err) => console.error("Redis Sub Client Error:", err));

io.adapter(createAdapter(pubClient, subClient));

io.on("connection", socketGateway);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.path);
  next();
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/image", imageRoute);
app.use("/api/v1/token", tokenRoute);
app.use(errorHandler);

export { server, io };
