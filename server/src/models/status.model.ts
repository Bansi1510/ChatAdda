import mongoose from "mongoose";
import { ref } from "node:process";

export interface IStatus {
  user: mongoose.Types.ObjectId,
  content: string,
  contentType: string,
  viewers: mongoose.Types.ObjectId[],
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date,
}


const statusSchema = new mongoose.Schema<IStatus>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ["image", "video", "text"],
    default: 'text'
  },
  viewers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

const Status = mongoose.model('Status', statusSchema);

export default Status