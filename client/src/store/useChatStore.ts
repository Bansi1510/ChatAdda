import { create } from "zustand";
import { getSocket } from "../services/chat.service";
import axios from "axios";
import baseUrl from "../services/baseApi.service";

type User = {
  _id: string;
  username?: string;
};

type MessageReaction = {
  emoji: string;
  reactionUserId: string;
};

export interface Message {
  _id: string;

  conversation: string;

  messageStatus?: string;

  receiver: User;

  sender?: User;

  reactions?: MessageReaction[];

  content?: string | null;

  contentType?: string;

  imageOrVideoUrl?: string | null;

  createdAt?: string;
};

type Conversation = {
  _id: string;
  participants?: User[];
  unreadCount?: number;
  lastMessage?: Message;
};

type OnlineUserStatus = {
  isOnline: boolean;
  lastSeen: string | Date | null;
};

type ChatState = {
  conversations: {
    data: Conversation[];
  };

  currentConversation: Conversation | null;

  messages: Message[];

  currentUser: string | null;

  loading: boolean;

  error: string | null;

  messageStatus: string;

  onlineUser: Map<string, OnlineUserStatus>;

  typingUser: Map<string, Set<string>>;

  // socket
  initializeSocketListener: () => void;

  // user
  setCurrentUser: (user: string) => void;

  // conversations
  fetchConversations: () => Promise<{
    data: Conversation[];
  } | null>;

  // messages
  fetchMessages: (conversationId: string) => Promise<Message[]>;

  receiveMessage: (msg: Message) => void;

  sendMessage: (formData: FormData) => void;

  // read
  markAsRead: () => Promise<void>;

  // delete
  deleteMessage: (messageId: string) => Promise<boolean | undefined>;

  // reactions
  addReaction: ({
    messageId,
    emoji,
  }: {
    messageId: string;
    emoji: string;
  }) => Promise<void>;

  // typing
  typingStart: (receiverId: string) => void;

  typingStop: (receiverId: string) => void;

  isUserTyping: (userId: string) => boolean | undefined;

  // online
  isUserOnline: (userId: string) => boolean | null;

  getUserLastSeen: (
    userId: string
  ) => string | Date | boolean | null;

  // cleanup
  cleanup: () => void;
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
      console.log("hello")
      set({ conversations: data, loading: false });
      get().initializeSocketListener();
      return data;
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
        currentConversation: { _id: conversationId },
        loading: false,
      })
      const { markAsRead } = get();
      markAsRead();
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
      }));

      if (msg.receiver._id === currentUser) {
        const { markAsRead } = get();
        markAsRead();
      }
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
  },
  sendMessage: async (formData: FormData) => {
    const senderId = formData.get("senderId");
    const receiverId = formData.get("receiverId");
    const media = formData.get("media");
    const content = formData.get("content");
    const messageStatus = formData.get("messageStatus");



    const { conversations } = get();

    let conversationId = null

    if (conversations.data.length > 0) {
      const con = conversations.data.find((conv) =>
        conv.participants?.some((p) => p._id === senderId) && conv.participants.some(p => p._id === receiverId)
      )

      if (con) {
        conversationId = con._id;
        set({ currentConversation: con })

      }
    }

    //message preview

    const id = `temp-${Date.now()}`;
    const preMessage = {
      _id: id,
      sender: { _id: senderId as string },
      receiver: { _id: receiverId as string },
      conversation: conversationId as string,
      imageOrVideoUrl: media && typeof media !== 'string' ? URL.createObjectURL(media) : null,
      content: content as string,
      contentType:
        media instanceof File
          ? media.type.startsWith("image")
            ? "image"
            : media.type.startsWith("video")
              ? "video"
              : "file"
          : "text",
      createdAt: new Date().toISOString(),
      messageStatus: messageStatus as string
    }

    set((state) => ({
      messages: [...state.messages, preMessage]
    }))
    try {
      const { data } = await baseUrl.post("/chat/send-message", formData, { headers: { "Content-Type": "multipart-form-data" } });
      const messageData = data.data || data

      //replace preMessage to real message
      set((state) => ({
        messages: state.messages.map((msg) => msg._id === id ? messageData : msg)
      }));

      return messageData;
    } catch (error) {
      console.log("sending message error ", error);
      set((state) => ({
        messages: state.messages.map((msg) => msg._id === id ? { ...msg, messageStatus: "failed" } : msg),
      }))
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data.message || error.message,
        })
      }
    }
  },

  //mark as a read

  markAsRead: async () => {
    const { messages, currentUser } = get();

    if (!messages.length || !currentUser) return;

    const unreadIds = messages.filter((msg) => msg.messageStatus === 'read' && msg.receiver?._id === currentUser).map((msg) => msg._id).filter(Boolean);

    if (unreadIds.length === 0) return;

    try {
      const { data } = await baseUrl.put("/chat/message/read", { messageIds: unreadIds });
      console.log(data)
      set((state) => ({
        messages: state.messages.map((msg) => unreadIds.includes(msg._id) ? { ...msg, messageStatus: "read" } : msg)
      }));

      const socket = getSocket();
      if (socket) {
        socket.emit("message_read", { messageIds: unreadIds, senderId: messages[0].sender?._id })
      }
    } catch (error) {
      console.log("mark as read error : ", error)
    }
  },

  //delete message

  deleteMessage: async (messageId: string) => {
    try {
      await baseUrl.delete(`/chat/message/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId)
      }))

      return true;
    } catch (error) {
      console.log("error in delete message : ", error)
    }
  },

  //addReactions

  addReaction: async ({ messageId, emoji }: { messageId: string, emoji: string }) => {
    const socket = getSocket();
    const { currentUser } = get();
    if (socket && currentUser) {
      socket.emit("add_reaction", { messageId, emoji, reactionUserId: currentUser });
    }
  },


  //typing start

  typingStart: (receiverId: string) => {
    const socket = getSocket();
    const { currentConversation } = get();

    if (receiverId && socket && currentConversation) {
      socket.emit("typing_start", { conversationId: currentConversation._id, receiverId });
    }
  },

  //typing stop
  typingStop: (receiverId: string) => {
    const socket = getSocket();
    const { currentConversation } = get();

    if (receiverId && socket && currentConversation) {
      socket.emit("typing_stop", { conversationId: currentConversation._id, receiverId });
    }
  },

  isUserTyping: (userId: string) => {
    const { typingUser, currentConversation } = get();

    if (!userId || !currentConversation) return false;

    return (
      typingUser
        .get(currentConversation._id)
        ?.has(userId)
    );
  },

  isUserOnline: (userId: string) => {
    if (!userId) return null;
    const { onlineUser } = get();
    return onlineUser.get(userId)?.isOnline || false
  },

  getUserLastSeen: (userId: string) => {
    if (!userId) return null;
    const { onlineUser } = get();
    return onlineUser.get(userId)?.isOnline || false
  },

  cleanup: () => {
    set({
      conversations: { data: [] },
      currentConversation: null,
      messages: [],
      onlineUser: new Map(),
      typingUser: new Map()

    })
  }
}))