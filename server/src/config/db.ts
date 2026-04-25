import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config({})

const mongodb_url = process.env.MONGODB;

if (!mongodb_url) {
  throw new Error("mongodb Url not found")
}
const connectDB = async () => {
  try {
    await mongoose.connect(mongodb_url);
    console.log("Database conneted");
  } catch (error) {
    console.log("Database connection failed ", error);
  }

}
export default connectDB;