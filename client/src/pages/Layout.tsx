import React, { useEffect, useState } from "react";
import useLayoutStore from "../store/useLayoutStore";
import useThemeStore from "../store/useThemeStore";
import ChatWindow from "../components/chat/ChatWindow";
import Sidebar from "./Sidebar";
import ChatLists from "../components/chat/ChatLists";
import Settings from "../components/setting/Settings";
import User from "./User";
import Status from "../components/status/Status";

type LayoutProps = {
  children?: React.ReactNode;
  isThemeDialogOpen?: boolean;
  toggleThemeDialog?: () => void;
  isStatusPreviewOpen?: boolean;
  statusPreviewContent?: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({
  isThemeDialogOpen,
  toggleThemeDialog,
  isStatusPreviewOpen,
  statusPreviewContent,
}) => {
  const selectedContact = useLayoutStore(
    (state) => state.selectedContact
  );
  const username = useLayoutStore((state) => state.username)
  const setSelectedContact = useLayoutStore(
    (state) => state.setSelectedContact
  );
  const activeTab = useLayoutStore((state) => state.activeTab);
  const { theme } = useThemeStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ NEW STATE
  const [showChatList] = useState(true);
  const profilePictures = useLayoutStore((state) => state.profilePictures);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  console.log(activeTab);
  return (
    <div
      className={`h-screen flex flex-1 min-h-0 ${theme === "dark" ? "bg-[#111b21]" : "bg-[#e5ddd5]"
        }`}
    >
      {/* ================= SIDEBAR ================= */}
      {(!isMobile || !selectedContact) && <Sidebar />}

      {activeTab === 'status' && <Status />}
      {/* ================= CHAT AREA ================= */}
      {(!isMobile || selectedContact || activeTab === "setting") && (
        <div className="flex-1 flex">

          {/* ✅ CHAT LIST */}
          {showChatList && (
            <div className="w-[320px] border-r border-gray-700">
              <div className="w-[320px] border-r border-gray-700">
                {activeTab === "setting" && <Settings />}

                {activeTab === "chat" && <ChatLists />}

                {activeTab === "profile" && <User />}
              </div>
            </div>
          )}

          {/* ✅ CHAT WINDOW */}
          <div className="flex-1 flex flex-col">
            <div
              className={`flex-1 overflow-y-auto p-4 ${theme === "dark"
                ? "bg-[#0b141a]"
                : "bg-[#efeae2]"
                }`}
            >
              {selectedContact ? (
                <ChatWindow
                  selectedContact={selectedContact}
                  setSelectedContact={setSelectedContact}
                  username={username as string}
                  profilePictures={profilePictures as string}
                  // ✅ PASS STATE
                  showChatList={showChatList}
                />
              ) : (
                <div
                  className={`h-full flex items-center justify-center ${theme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
                    }`}
                >
                  Select a chat to start messaging
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= THEME MODAL ================= */}
      {isThemeDialogOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div
            className={`p-6 rounded-lg ${theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-black"
              }`}
          >
            <h2 className="mb-4">Select Theme</h2>

            <button
              onClick={toggleThemeDialog}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= STATUS PREVIEW ================= */}
      {isStatusPreviewOpen && (
        <div className="absolute inset-0 bg-black flex items-center justify-center text-white">
          {statusPreviewContent}
        </div>
      )}
    </div>
  );
};

export default Layout;