import React, { useEffect, useRef, useState } from "react";
import useLayoutStore from "../../store/useLayoutStore";
import useThemeStore from "../../store/useThemeStore";
import useUserStore from "../../store/useUserStore";
import { useChatStore } from "../../store/useChatStore";

type Props = {
  selectedContact: string,
  setSelectedContact: (contact: string) => void
  isMobile: () => void
}
const isValidate = (date: Date | number) => {
  return date instanceof Date && !isNaN(date.getTime());
}
const ChatWindow = ({ selectedContact, setSelectedContact, isMobile }: Props) => {

  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const typingTimeOutRef = useRef<number | null>(null);
  const messageRef = useRef<HTMLDivElement | null>();
  const emojiPickerRef = useRef<HTMLDivElement | null>();
  const fileInputRef = useRef<HTMLDivElement | null>();

  const { theme } = useThemeStore();
  const { user } = useUserStore();
  const { isUserOnline, getUserLastSeen, isUserTyping, conversations, fetchMessages, fetchConversations, messages, typingStart, typingStop, sendMessage } = useChatStore();
  const isOnline = isUserOnline(selectedContact);
  const lastSeen = getUserLastSeen(selectedContact);
  const isTyping = isUserTyping(selectedContact);

  useEffect(() => {
    if (selectedContact && conversations.data.length > 0) {
      const conversation = conversations.data.find((con) =>
        con.participants?.some((p) => p._id === selectedContact)
      )
      if (conversation?._id) {
        fetchMessages(conversation._id)
      }
    }
  }, [selectedContact, conversations, fetchMessages])

  useEffect(() => {
    fetchConversations();
  })

  const scrollToBottom = () => {
    messageRef.current?.scrollIntoView({ behavior: "auto" })
  }
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (message && selectedContact) {
      typingStart(selectedContact);
      if (typingTimeOutRef.current) {
        clearTimeout(typingTimeOutRef.current)
      }
    }
    typingTimeOutRef.current = setTimeout(() => {
      typingStop(selectedContact)
    }, 2000);

    return () => {
      if (typingTimeOutRef.current) clearTimeout(typingTimeOutRef.current)
    }
  }, [message, selectedContact, typingStart, typingStop]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file);
      setShowFileMenu(false);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  }
  const handleSendMessage = async () => {
    if (!selectedContact || !user) return;
    setFilePreview(null);

    try {
      const formData = new FormData();

      formData.append("senderId", user?._id);
      formData.append("receiverId", selectedContact);

      const status = isOnline ? "delivered" : "send";
      formData.append("messageStatus", status);

      if (message.trim()) formData.append("content", message.trim());

      if (selectedFile) formData.append("media", selectedFile, selectedFile.name);

      if (!message.trim() && !selectedFile) return;

      await sendMessage(formData);

      setMessage("");
      setFilePreview(null)
      setSelectedFile(null);
      setShowFileMenu(false)
    } catch (error) {
      console.log("send message error ", error)
    }
  }
  return (
    <div className="p-4">
      <h2>Chat with {selectedContact}</h2>

      {/* Messages */}
      <div className="mt-4 space-y-2">
        <div className="bg-blue-500 text-white p-2 rounded w-fit">
          Hello 👋
        </div>
        <div className="bg-gray-300 p-2 rounded w-fit">
          Hi!
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;