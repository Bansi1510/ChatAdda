import cookieParser from "cookie-parser";
import express, { Application } from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db";
import userRouter from "./routes/user.routes";
import chatRouter from "./routes/chat.routes";
import http from "http";
import initializeSocket from "./services/socket";
import statusRouter from "./routes/status.routes";

dotenv.config({});


const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

//create server
const server = http.createServer(app);

const io = initializeSocket(server);

//apply for all routes
app.use((req, res, next) => {
  req.io = io;
  req.socketUserMap = io.socketUserMap
  next();
});


app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/status", statusRouter);


const PORT = process.env.BACKEND_PORT;
server.listen(PORT, async () => {
  await connectDB();
  console.log(`backend run on port :${PORT} `);
});