import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import useLayoutStore from "../../store/useLayoutStore";
import useThemeStore from "../../store/useThemeStore";
import useUserStore from "../../store/useUserStore";

import { getAllUsersAPI } from "../../services/user.service";

import { useChatStore } from "../../store/useChatStore";

type Contact = {
  _id: string;
  username: string;
  profilePictures?: string;
};

const ChatLists: React.FC = () => {
  const { theme } = useThemeStore();

  const { user } = useUserStore();

  const [contacts, setContacts] =
    useState<Contact[]>([]);

  const [search, setSearch] =
    useState("");

  const conversations = useChatStore(
    (state) =>
      state.conversations.data
  );

  const fetchConversations =
    useChatStore(
      (state) =>
        state.fetchConversations
    );

  const selectedContact =
    useLayoutStore(
      (state) =>
        state.selectedContact
    );

  const setSelectedContact =
    useLayoutStore(
      (state) =>
        state.setSelectedContact
    );

  const setUsername =
    useLayoutStore(
      (state) => state.setUsername
    );

  const setProfilePictures =
    useLayoutStore(
      (state) =>
        state.setProfilePictures
    );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res =
          await getAllUsersAPI();

        if (
          res.status === "success"
        ) {
          setContacts(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getUsers();
  }, []);

  // MAP conversations by userId
  const conversationMap =
    useMemo(() => {
      const map = new Map();

      conversations.forEach((con) => {
        const participant =
          con.participants?.find(
            (p) =>
              p._id !== user?._id
          );

        if (participant?._id) {
          map.set(
            participant._id,
            con
          );
        }
      });

      return map;
    }, [conversations, user]);

  const filteredContacts =
    contacts.filter((c) =>
      c.username
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div
      className={`h-full flex flex-col ${theme === "dark"
          ? "bg-[#111b21]"
          : "bg-white"
        }`}
    >
      {/* SEARCH */}
      <div className="p-2">
        <input
          type="text"
          placeholder="Search or start new chat"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className={`w-full px-4 py-2 rounded-lg outline-none ${theme === "dark"
              ? "bg-[#202c33] text-white placeholder-gray-400"
              : "bg-gray-100 text-black placeholder-gray-500"
            }`}
        />
      </div>

      {/* CONTACT LIST */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map(
          (contact) => {
            const conversation =
              conversationMap.get(
                contact._id
              );

            const isSelected =
              selectedContact ===
              contact._id;

            return (
              <div
                key={contact._id}
                onClick={() => {
                  setSelectedContact(
                    contact._id
                  );

                  setUsername(
                    contact.username
                  );

                  setProfilePictures(
                    contact.profilePictures ||
                    ""
                  );
                }}
                className={`flex items-center gap-3 p-3 cursor-pointer transition ${isSelected
                    ? "bg-[#2a3942] text-white"
                    : theme === "dark"
                      ? "hover:bg-[#202c33] text-white"
                      : "hover:bg-gray-100 text-black"
                  }`}
              >
                {/* PROFILE */}
                {contact.profilePictures ? (
                  <img
                    src={
                      contact.profilePictures
                    }
                    alt={
                      contact.username
                    }
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                    {contact.username
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      {
                        contact.username
                      }
                    </span>

                    {conversation
                      ?.lastMessage
                      ?.createdAt && (
                        <span className="text-[11px] text-gray-400">
                          {new Date(
                            conversation.lastMessage.createdAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour:
                                "2-digit",
                              minute:
                                "2-digit",
                            }
                          )}
                        </span>
                      )}
                  </div>

                  {/* LAST MESSAGE */}
                  {conversation
                    ?.lastMessage && (
                      <span className="text-sm text-gray-400 truncate block">
                        {conversation
                          .lastMessage
                          .imageOrVideoUrl
                          ? "📎 Media"
                          : conversation
                            .lastMessage
                            .content}
                      </span>
                    )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default ChatLists;