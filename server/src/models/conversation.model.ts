import mongoose from "mongoose";


export interface IConversaction {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  unreadCount: number,
  createdAt: Date,
  updatedAt: Date,
}

const conversationSchema = new mongoose.Schema<IConversaction>({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  unreadCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Conversation = mongoose.model("Conversaction", conversationSchema);

export default Conversation;