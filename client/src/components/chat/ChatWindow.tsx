import React, { useRef, useState } from "react";
import useThemeStore from "../../store/useThemeStore";
import useUserStore from "../../store/useUserStore";
import {
  useChatStore,
  type Message,
} from "../../store/useChatStore";

import {
  ArrowLeft,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Image as ImageIcon,
  File,
  X,
  Smile,
} from "lucide-react";

import {
  format,
  isToday,
  isYesterday,
} from "date-fns";

import EmojiPicker, {
  Theme,
} from "emoji-picker-react";

import MessageList from "./MessageList";

import useTyping from "../../hooks/useTyping";
import useFileUpload from "../../hooks/useFileUpload";
import useScrollToBottom from "../../hooks/useScrollToBottom";
import useChatMessages from "../../hooks/useChatMessages";

type Props = {
  selectedContact: string;
  setSelectedContact: (
    id: string | null
  ) => void;
  username: string;
  showChatList: boolean;
  profilePictures: string;
};

const isValidate = (
  date: Date | number
) => {
  return (
    date instanceof Date &&
    !isNaN(date.getTime())
  );
};

const ChatWindow = ({
  selectedContact,
  setSelectedContact,
  username,
  profilePictures,
}: Props): React.ReactElement => {
  const [message, setMessage] =
    useState("");

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  const [showFileMenu, setShowFileMenu] =
    useState(false);

  const messageRef =
    useRef<HTMLDivElement | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const { theme } = useThemeStore();

  const { user } = useUserStore();

  const {
    isUserOnline,
    getUserLastSeen,
    isUserTyping,
    messages,
    typingStart,
    typingStop,
    sendMessage,
    addReaction,
  } = useChatStore();

  const {
    selectedFile,
    filePreview,
    handleFileChange,
    removeFile,
  } = useFileUpload();

  useTyping({
    message,
    selectedContact,
    typingStart,
    typingStop,
  });

  useScrollToBottom(
    messageRef,
    messages
  );

  useChatMessages(selectedContact);

  const isOnline = isUserOnline(
    selectedContact
  );

  const lastSeen = getUserLastSeen(
    selectedContact
  );

  const isTyping = isUserTyping(
    selectedContact
  );

  const handleSendMessage =
    async () => {
      if (!selectedContact || !user)
        return;

      try {
        const formData =
          new FormData();

        formData.append(
          "senderId",
          user._id
        );

        formData.append(
          "receiverId",
          selectedContact
        );

        const status = isOnline
          ? "delivered"
          : "send";

        formData.append(
          "messageStatus",
          status
        );

        if (message.trim()) {
          formData.append(
            "content",
            message.trim()
          );
        }

        if (selectedFile) {
          formData.append(
            "media",
            selectedFile,
            selectedFile.name
          );
        }

        if (
          !message.trim() &&
          !selectedFile
        )
          return;

        await sendMessage(formData);

        setMessage("");
        removeFile();
        setShowFileMenu(false);
      } catch (error) {
        console.log(
          "send message error ",
          error
        );
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
      dateStr = format(
        date,
        "EEEE, MMMM d"
      );
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

  const groupedMessages =
    messages.reduce<
      Record<string, Message[]>
    >((acc, msg) => {
      if (!msg.createdAt)
        return acc;

      const date = new Date(
        msg.createdAt
      );

      if (isValidate(date)) {
        const dateStr = format(
          date,
          "yyyy-MM-dd"
        );

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
    addReaction({
      messageId,
      emoji,
    });
  };

  if (
    !selectedContact ||
    !username
  ) {
    return <div />;
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
        className={`h-16 px-4 flex items-center justify-between border-b backdrop-blur-sm sticky top-0 z-20 transition-colors duration-300
        ${theme === "dark"
            ? "bg-[#202c33]/95 border-[#2f3b43] text-white"
            : "bg-[#f0f2f5]/95 border-gray-200 text-black"
          }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() =>
              setSelectedContact(null)
            }
            className="group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 active:scale-90 hover:bg-black/10"
          >
            <ArrowLeft
              size={21}
              className="text-gray-400 group-hover:text-white transition-all duration-200 group-hover:-translate-x-1"
            />
          </button>

          <div className="relative shrink-0">
            {profilePictures ? (
              <img
                src={profilePictures}
                alt="profile"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent hover:ring-green-500/40 transition-all duration-300"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                {username
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#202c33]" />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-[15px] truncate">
              {username}
            </h2>

            <p
              className={`text-xs truncate
              ${isTyping
                  ? "text-green-500 font-medium"
                  : "text-gray-400"
                }`}
            >
              {isTyping
                ? "typing..."
                : isOnline
                  ? "online"
                  : lastSeen
                    ? `last seen ${format(
                      new Date(
                        lastSeen as string
                      ),
                      "hh:mm a"
                    )}`
                    : "offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-green-500 hover:bg-black/10 transition-all duration-200 active:scale-90">
            <Phone size={19} />
          </button>

          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-green-500 hover:bg-black/10 transition-all duration-200 active:scale-90">
            <Video size={21} />
          </button>

          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/10 transition-all duration-200 active:scale-90">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <MessageList
        groupedMessages={
          groupedMessages
        }
        user={user}
        theme={theme}
        renderDateSeparator={
          renderDateSeparator
        }
        handleReaction={
          handleReaction
        }
        messageRef={messageRef}
      />

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
              onClick={removeFile}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* INPUT */}
      <div
        className={`px-3 py-2 flex items-center gap-2 border-t relative
        ${theme === "dark"
            ? "bg-[#202c33] border-[#2f3b43]"
            : "bg-[#f0f2f5] border-gray-200"
          }`}
      >
        {/* EMOJI */}
        <div className="relative">
          <button
            onClick={() =>
              setShowEmojiPicker(
                !showEmojiPicker
              )
            }
            className="text-gray-500 hover:text-green-500"
          >
            <Smile size={22} />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker
                onEmojiClick={(
                  emojiData
                ) => {
                  setMessage(
                    (prev) =>
                      prev +
                      emojiData.emoji
                  );

                  setShowEmojiPicker(
                    false
                  );
                }}
                theme={
                  theme === "dark"
                    ? Theme.DARK
                    : Theme.LIGHT
                }
                width={280}
                height={350}
              />
            </div>
          )}
        </div>

        {/* FILE */}
        <div className="relative">
          <button
            onClick={() =>
              setShowFileMenu(
                !showFileMenu
              )
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
            onChange={
              handleFileChange
            }
          />
        </div>

        {/* TEXT INPUT */}
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
              setMessage(
                e.target.value
              )
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
          onClick={
            handleSendMessage
          }
          className="w-11 h-11 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-lg transition"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;