import { create } from "zustand";
import { getSocket } from "../services/chat.service";
import axios from "axios";
import baseUrl from "../services/baseApi.service";

type Message = {
  _id: string;
  conversation: string;
};
type User = {
  _id: string;
  username: string;
};
type Conversation = {
  _id: string;
  participants: User[] | null;
  unreadCount?: number;
  lastMessage?: Message;
};

type ChatState = {
  conversations: {
    data: Conversation[];
  };
  currentConversation: Conversation | null
  messages: Message[];
  currentUser: string | null
  loading: boolean;
  error: string | null;
  messageStatus: string;
  onlineUser: Map<string, {
    isOnline: boolean,
    lastSeen: string | null | Date
  }>;
  typingUser: Map<string, Set<string>>;
  initializeSocketListener: () => void;
};


export const useChatStore = create<ChatState>((set, get) => ({
  conversations: {
    data: []
  },
  currentUser: null,
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

    //user typing status

    socket.on(
      "user_typing",
      ({
        userId,
        conversationId,
        isTyping,
      }: {
        userId: string;
        conversationId: string;
        isTyping: boolean;
      }) => {
        set((state) => {
          const newTypingUser = new Map(state.typingUser);

          if (!newTypingUser.has(conversationId)) {
            newTypingUser.set(conversationId, new Set<string>());
          }

          const typingSet = newTypingUser.get(conversationId);

          if (!typingSet) {
            return state;
          }

          if (isTyping) {
            typingSet.add(userId);
          } else {
            typingSet.delete(userId);
          }

          return {
            typingUser: newTypingUser,
          };
        });
      }
    );

    //user online or not

    socket.on("user_status", ({ userId, isOnline, lastSeen }) => {
      set((state) => {
        const newOnlineUsers = new Map(state.onlineUser);
        newOnlineUsers.set(userId, { isOnline, lastSeen })
        return { onlineUser: newOnlineUsers }
      })
    })

    //emit status check for all users in conversation list 

    const { conversations } = get();

    if (conversations.data.length > 0) {
      conversations.data.forEach((con) => {
        const otherUser = con?.participants?.find((p) => p._id !== get().currentConversation?._id)

        if (otherUser?._id) {
          socket.emit("get_user_status", otherUser._id, ({ userId, isOnline, lastSeen }: { userId: string; isOnline: boolean; lastSeen: string | null | Date }) => {
            set((state) => {
              const newOnlineUsers = new Map(state.onlineUser);
              newOnlineUsers.set(userId, {
                isOnline: isOnline,
                lastSeen: lastSeen
              })
              return { onlineUser: newOnlineUsers }
            })
          })
        }
      })
    }

  },
  setCurrentUser: (user: string) => set({ currentUser: user }),

  fetchConversations: async () => {
    set({ loading: true, error: null });

    try {
      const { data } = await baseUrl.get("/chat/conversations");
      set({ conversations: data, loading: false });
      get().initializeSocketListener();
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data.message || error.message,
          loading: false
        })
      }
      return null
    }
  },


  fetchMessages: async (conversationId: string) => {
    if (!conversationId) return;
    set({ loading: true, error: null })
    try {
      const { data } = await baseUrl.get(`/chat/conversations/${conversationId}/messages`);
      const messgaesArr = data.data || data || []
      set({
        messages: messgaesArr,
        currentConversation: { _id: conversationId, participants: null },
        loading: false,
      })
      //mark as read
      return messgaesArr;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data.message || error.message,
          loading: false
        })
      }
      return []
    }
  },

  receiveMessage: (msg: { _id: string, conversation: string, receiver: User }) => {
    if (!msg) return;

    const { currentConversation, currentUser, messages } = get();

    const messageExits = messages.some((message) => message._id === msg._id);
    if (messageExits) return;

    if (msg.conversation === currentConversation?._id) {
      set((state) => ({
        messages: [...state.messages, msg]
      }))
    }


    //update conversaction preview and unread count

    set((state) => {
      const updateConvesations = state.conversations.data.map((con) => {
        if (con._id === msg.conversation) {
          return {
            ...con,
            lastMessage: msg,
            unreadCount: msg.receiver._id === currentUser ? (con.unreadCount || 0) + 1 : con.unreadCount || 0
          }

        }
        return con;
      })
      return {
        conversations: {
          ...state.conversations,
          data: updateConvesations
        }
      }
    })
  }

}))