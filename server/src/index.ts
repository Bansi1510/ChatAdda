import cookieParser from "cookie-parser";
import express, { Application } from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db";

dotenv.config({});


const app: Application = express();

app.use(express.urlencoded());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173/",
  credentials: true
}));

const PORT = process.env.BACKEND_PORT;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`backend run on port :${PORT} `);
});