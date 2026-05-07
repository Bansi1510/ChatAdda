import { create } from "zustand";
import { getSocket } from "../services/chat.service";

type Message = {
  _id: string;
  text: string;
};

type Conversation = {
  _id: string;
};

type ChatState = {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  messageStatus: string;
  onlineUser: Map<string, string>;
  typingUser: Map<string, string>;
};


export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  messageStatus: "",
  onlineUser: new Map(),
  typingUser: new Map(),


  //socket event listener setup
  initializeSocketListener: () => {
    const socket = getSocket();
    if (!socket) return;

    //remove exiting listerners to prevent duplicate handlers

    socket.off("send_message");
    socket.off("receive_message");
    socket.off("typing_start");
    socket.off("user_status");
    socket.off("message_error");
    socket.off("message_delete");

    //receive message

    socket.on("receive_message", (message) => {
      console.log(message)
    })


    //send message

    socket.on("send_message", (message: Message) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === message._id
            ? { ...msg, ...message }
            : msg
        ),
      }));
    });

    //chnage message status

    socket.on("message_status_update", ({ messageId, messageStatus }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, messageStatus } : msg)
      }))
    })
    //update reaction on message

    socket.on("reaction_update", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg)
      }))
    })

    //delete message

    socket.on("message_delete", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter((msg) =>
          msg._id !== messageId)
      }))
    })

    //message error

    socket.on("message_error", (message) => {
      console.log(message);
    })
  }

}))