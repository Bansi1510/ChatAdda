import cookieParser from "cookie-parser";
import express, { Application } from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db";
import userRouter from "./routes/user.routes";

dotenv.config({});


const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173/",
  credentials: true
}));

app.use("/api/user", userRouter);


const PORT = process.env.BACKEND_PORT;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`backend run on port :${PORT} `);
});