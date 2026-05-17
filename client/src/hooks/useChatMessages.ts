import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";

const useChatMessages = (
  selectedContact: string
) => {
  const lastFetchedConvId =
    useRef<string | null>(null);

  const {
    conversations,
    fetchMessages,
    fetchConversations,
    setMessages,
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (
      !selectedContact ||
      conversations.data.length === 0
    )
      return;

    const conversation =
      conversations.data.find((con) =>
        con.participants?.some(
          (p) => p._id === selectedContact
        )
      );

    if (!conversation?._id) return;

    if (
      conversation._id ===
      lastFetchedConvId.current
    )
      return;

    lastFetchedConvId.current =
      conversation._id;

    setMessages([]);

    fetchMessages(conversation._id);
  }, [selectedContact, conversations.data, fetchMessages, setMessages]);

  return {};
};

export default useChatMessages;