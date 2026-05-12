import React, { useEffect, useRef, useState } from "react";
import useThemeStore from "../../store/useThemeStore";
import useUserStore from "../../store/useUserStore";
import { useChatStore, type Message } from "../../store/useChatStore";
import {
  isToday,
  isYesterday,
  format
} from "date-fns";
import {
  ArrowLeft,
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Image as ImageIcon,
  File,
  X,
  CheckCheck
} from "lucide-react";

type Props = {
  selectedContact: string;
  setSelectedContact: (id: string | null) => void;
  username: string
  showChatList: boolean;
  setShowChatList: React.Dispatch<React.SetStateAction<boolean>>;
};
const isValidate = (date: Date | number) => {
  return date instanceof Date && !isNaN(date.getTime());
};

const ChatWindow = ({
  selectedContact,
  setSelectedContact,
  setShowChatList,
  username

}: Props) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const typingTimeOutRef = useRef<number | null>(null);
  const messageRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { theme } = useThemeStore();
  const { user } = useUserStore();
  console.log(selectedContact)
  const {
    isUserOnline,
    getUserLastSeen,
    isUserTyping,
    conversations,
    fetchMessages,
    fetchConversations,
    messages,
    typingStart,
    typingStop,
    sendMessage,
    addReaction
  } = useChatStore();

  const isOnline = isUserOnline(selectedContact as string);
  const lastSeen = getUserLastSeen(selectedContact as string);
  const isTyping = isUserTyping(selectedContact as string);

  useEffect(() => {
    if (selectedContact && conversations.data.length > 0) {
      const conversation = conversations.data.find((con) =>
        con.participants?.some((p) => p._id === selectedContact)
      );

      if (conversation?._id) {
        fetchMessages(conversation._id);
      }
    }
  }, [selectedContact, conversations, fetchMessages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const scrollToBottom = () => {
    messageRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (message && selectedContact) {
      typingStart(selectedContact);

      if (typingTimeOutRef.current) {
        clearTimeout(typingTimeOutRef.current);
      }
    }

    typingTimeOutRef.current = window.setTimeout(() => {
      typingStop(selectedContact as string);
    }, 2000);

    return () => {
      if (typingTimeOutRef.current) {
        clearTimeout(typingTimeOutRef.current);
      }
    };
  }, [message, selectedContact, typingStart, typingStop]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setShowFileMenu(false);

      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !user) return;

    setFilePreview(null);

    try {
      const formData = new FormData();

      formData.append("senderId", user?._id);
      formData.append("receiverId", selectedContact);

      const status = isOnline ? "delivered" : "send";

      formData.append("messageStatus", status);

      if (message.trim()) {
        formData.append("content", message.trim());
      }

      if (selectedFile) {
        formData.append(
          "media",
          selectedFile,
          selectedFile.name
        );
      }

      if (!message.trim() && !selectedFile) return;

      await sendMessage(formData);

      setMessage("");
      setFilePreview(null);
      setSelectedFile(null);
      setShowFileMenu(false);
    } catch (error) {
      console.log("send message error ", error);
    }
  };

  const renderDateSeparator = (
    date: number | Date
  ) => {
    if (!isValidate(date)) return;

    let dateStr;

    if (isToday(date)) {
      dateStr = "Today";
    } else if (isYesterday(date)) {
      dateStr = "Yesterday";
    } else {
      dateStr = format(date, "EEEE, MMMM d");
    }

    return (
      <div className="flex justify-center my-5">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-medium shadow-sm backdrop-blur-sm
          ${theme === "dark"
              ? "bg-[#202c33] text-gray-300"
              : "bg-white text-gray-600"
            }`}
        >
          {dateStr}
        </span>
      </div>
    );
  };

  const groupedMessages = messages.reduce<

    Record<string, Message[]>
  >((acc, msg) => {
    if (!msg.createdAt) return acc;

    const date = new Date(msg.createdAt);

    if (isValidate(date)) {
      const dateStr = format(date, "yyyy-MM-dd");

      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }

      acc[dateStr].push(msg);
    }

    return acc;
  }, {});

  const handleReaction = (
    messageId: string,
    emoji: string
  ) => {
    addReaction({ messageId, emoji });
  };

  if (!selectedContact) {
    return <div></div>;
  }

  return (

    <div
      className={`h-screen flex flex-col
      ${theme === "dark"
          ? "bg-[#0b141a] text-white"
          : "bg-[#efeae2] text-black"
        }`}
    >
      {/* HEADER */}
      <div
        className={`h-16 px-4 flex items-center justify-between border-b z-20
        ${theme === "dark"
            ? "bg-[#202c33] border-[#2f3b43]"
            : "bg-[#f0f2f5] border-gray-200"
          }`}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedContact(null)}
            className="lg:hidden"
          >
            <ArrowLeft size={22} />
          </button>
          <button
            onClick={() => setShowChatList((prev) => !prev)}
            className="p-2 bg-green-500 text-white rounded"
          >
            Toggle Chat List
          </button>

          <div className="relative">
            <img
              src="favicon.svg"
              alt="image"
              className="w-11 h-11 rounded-full object-cover"
            />

            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
            )}
          </div>

          <div>
            <h2 className="font-semibold text-[15px]">
              {username}
            </h2>

            <p className="text-xs text-gray-400">
              {isTyping
                ? "typing..."
                : isOnline
                  ? "online"
                  : lastSeen
                    ? `last seen ${format(
                      new Date(lastSeen as string),
                      "hh:mm a"
                    )}`
                    : "offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-gray-400">
          <Phone
            size={20}
            className="cursor-pointer hover:text-green-500"
          />
          <Video
            size={22}
            className="cursor-pointer hover:text-green-500"
          />
          <MoreVertical
            size={20}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* CHAT AREA */}
      <div
        className="flex-1 overflow-y-auto px-4 py-5 bg-cover bg-center"
        style={{
          backgroundColor:
            theme === "dark"
              ? "#0b141a"
              : "#efeae2"
        }}
      >
        {Object.entries(groupedMessages).map(
          ([date, msgs]) => (
            <div key={date}>
              {renderDateSeparator(new Date(date))}

              <div className="space-y-2">
                {msgs.map((msg) => {
                  const isMine =
                    msg.sender?._id === user?._id;

                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine
                        ? "justify-end"
                        : "justify-start"
                        }`}
                    >
                      <div
                        className={`group relative max-w-[75%] px-3 py-2 rounded-lg shadow-sm
                        ${isMine
                            ? theme === "dark"
                              ? "bg-[#005c4b] text-white rounded-br-none"
                              : "bg-[#d9fdd3] text-black rounded-br-none"
                            : theme === "dark"
                              ? "bg-[#202c33] text-white rounded-bl-none"
                              : "bg-white text-black rounded-bl-none"
                          }`}
                      >
                        {/* IMAGE */}
                        {msg.imageOrVideoUrl && (
                          <img
                            src={msg.imageOrVideoUrl}
                            alt=""
                            className="rounded-lg mb-2 max-h-72 object-cover"
                          />
                        )}

                        {/* TEXT */}
                        {msg.content && (
                          <p className="text-sm break-words">
                            {msg.content}
                          </p>
                        )}

                        {/* REACTIONS */}
                        <div className="flex gap-1 mt-2">
                          {["❤️", "😂", "👍"].map(
                            (emoji) => (
                              <button
                                key={emoji}
                                onClick={() =>
                                  handleReaction(
                                    msg._id,
                                    emoji
                                  )
                                }
                                className="opacity-0 group-hover:opacity-100 transition text-xs hover:scale-125"
                              >
                                {emoji}
                              </button>
                            )
                          )}
                        </div>

                        {/* TIME */}
                        <div className="flex justify-end items-center gap-1 mt-1">
                          <span className="text-[10px] opacity-70">
                            {msg.createdAt
                              ? format(
                                new Date(msg.createdAt),
                                "hh:mm a"
                              )
                              : ""}
                          </span>

                          {isMine && (
                            <>
                              {msg.messageStatus ===
                                "seen" ? (
                                <CheckCheck
                                  size={14}
                                  className="text-blue-400"
                                />
                              ) : (
                                <CheckCheck
                                  size={14}
                                  className="opacity-60"
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        <div ref={messageRef} />
      </div>

      {/* FILE PREVIEW */}
      {filePreview && (
        <div
          className={`px-4 py-3 border-t
          ${theme === "dark"
              ? "bg-[#202c33] border-[#2f3b43]"
              : "bg-white border-gray-200"
            }`}
        >
          <div className="relative w-fit">
            <img
              src={filePreview}
              alt=""
              className="h-24 rounded-lg object-cover"
            />

            <button
              onClick={() => {
                setFilePreview(null);
                setSelectedFile(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* INPUT AREA */}
      <div
        className={`px-3 py-2 flex items-center gap-2 border-t relative
        ${theme === "dark"
            ? "bg-[#202c33] border-[#2f3b43]"
            : "bg-[#f0f2f5] border-gray-200"
          }`}
      >
        {/* EMOJI */}
        <button
          onClick={() =>
            setShowEmojiPicker(!showEmojiPicker)
          }
          className="text-gray-500 hover:text-green-500"
        >
          <Smile size={24} />
        </button>

        {/* FILE */}
        <div className="relative">
          <button
            onClick={() =>
              setShowFileMenu(!showFileMenu)
            }
            className="text-gray-500 hover:text-green-500"
          >
            <Paperclip size={22} />
          </button>

          {showFileMenu && (
            <div
              className={`absolute bottom-12 left-0 w-44 rounded-xl shadow-2xl p-2
              ${theme === "dark"
                  ? "bg-[#233138]"
                  : "bg-white"
                }`}
            >
              <button
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2f3b43]"
              >
                <ImageIcon size={18} />
                Photos & Videos
              </button>

              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2f3b43]">
                <File size={18} />
                Document
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileChange}
          />
        </div>

        {/* INPUT */}
        <div
          className={`flex-1 rounded-full px-4 py-2
          ${theme === "dark"
              ? "bg-[#2a3942]"
              : "bg-white"
            }`}
        >
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            className="w-full bg-transparent outline-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
        </div>

        {/* SEND */}
        <button
          onClick={handleSendMessage}
          className="w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-lg transition"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;