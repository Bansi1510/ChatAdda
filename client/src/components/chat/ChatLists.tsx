import React, { useEffect, useState } from "react";
import useLayoutStore from "../../store/useLayoutStore";
import useThemeStore from "../../store/useThemeStore";
import { getAllUsersAPI } from "../../services/user.service";
import { toast } from "react-toastify";

type Contact = {
  _id: string;
  username: string;
  profilePictures?: string;
};



const ChatLists: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[] | []>([]);

  const getAllUsers = async () => {
    try {
      const res = await getAllUsersAPI();
      console.log(res.data)
      if (res.status === 'success') setContacts(res.data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      getAllUsers();

    }
    fetchData();
  }, [])
  const setSelectedContact = useLayoutStore(
    (state) => state.setSelectedContact
  );
  const selectedContact = useLayoutStore(
    (state) => state.selectedContact
  );
  const setUsername = useLayoutStore((state) => state.setUsername);
  const setProfilePictures = useLayoutStore((state) => state.setProfilePictures);
  console.log(selectedContact)
  const { theme } = useThemeStore();
  const [search, setSearch] = useState("");

  const filteredContacts = contacts.filter((c) =>
    c?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`h-full flex flex-col ${theme === "dark" ? "bg-[#111b21]" : "bg-white"
        }`}
    >
      {/* 🔍 Search Bar */}
      <div className="p-2">
        <input
          type="text"
          placeholder="Search or start new chat"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg outline-none ${theme === "dark"
            ? "bg-[#202c33] text-white placeholder-gray-400"
            : "bg-gray-100 text-black placeholder-gray-500"
            }`}
        />
      </div>

      {/* 👥 Contact List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((c, index) => {
            const isSelected = selectedContact === c._id;

            return (
              <div
                key={index}
                onClick={() => {
                  setSelectedContact(c._id);
                  setUsername(c.username)
                  setProfilePictures(c.profilePictures as string);
                }}
                className={`flex items-center gap-3 p-3 cursor-pointer transition ${isSelected
                  ? "bg-[#2a3942] text-white"
                  : theme === "dark"
                    ? "hover:bg-[#202c33] text-white"
                    : "hover:bg-gray-100 text-black"
                  }`}
              >
                {/* 🖼️ Profile Picture */}
                {c.profilePictures?.trim() ? (
                  <img
                    src={c.profilePictures}
                    alt={c.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white font-semibold">
                    {c.username.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* 📛 User Info */}
                <div className="flex flex-col">
                  <span className="font-medium">
                    {c.username}
                  </span>
                  <span className="text-sm text-gray-400">
                    Last message...
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 mt-4">
            No contacts found
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLists;