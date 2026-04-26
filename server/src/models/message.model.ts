import mongoose from "mongoose";

export interface IReaction {
  user: mongoose.Types.ObjectId,
  emoji: String,
}
export interface IMessage {
  conversaction: mongoose.Types.ObjectId,
  sender: mongoose.Types.ObjectId,
  receiver: mongoose.Types.ObjectId,
  content: String,
  imageOrVideoUrl: String,
  contentType: "image" | "video" | "text",
  reactions: IReaction[],
  messageStatus: string
  createdAt: Date,
  updatedAt: Date,
}

const messageSchema = new mongoose.Schema<IMessage>({
  conversaction: {
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
    default: "send"
  }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;