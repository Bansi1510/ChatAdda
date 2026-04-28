import mongoose from "mongoose";
import { symlink } from "node:fs";

export interface IReaction {
  user: mongoose.Types.ObjectId,
  emoji: string,
}
export interface IMessage {
  conversation: mongoose.Types.ObjectId,
  sender: mongoose.Types.ObjectId,
  receiver: mongoose.Types.ObjectId,
  content: string,
  imageOrVideoUrl: string,
  contentType: "image" | "video" | "text",
  reactions: IReaction[],
  messageStatus: string
  createdAt: Date,
  updatedAt: Date,
}

const messageSchema = new mongoose.Schema<IMessage>({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversaction",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: String,
  imageOrVideoUrl: {
    type: String,
  },
  contentType: {
    type: String,
    enum: ["image", "video", "text"]
  },
  reactions: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      emoji: String
    }
  ],
  messageStatus: {
    type: String,
    default: "send",
    enum: ["send", "delivered", "read"]
  }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;