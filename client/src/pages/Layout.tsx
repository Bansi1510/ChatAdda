import React, { useEffect, useState } from "react";
import useLayoutStore from "../store/useLayoutStore";
import useThemeStore from "../store/useThemeStore";
import ChatWindow from "../components/chat/ChatWindow";
import Sidebar from "./Sidebar";
import ChatLists from "../components/chat/ChatLists";

type LayoutProps = {
  children?: React.ReactNode;
  isThemeDialogOpen: boolean;
  toggleThemeDialog: () => void;
  isStatusPreviewOpen: boolean;
  statusPreviewContent: React.ReactNode;
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
  const { theme } = useThemeStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ NEW STATE
  const [showChatList, setShowChatList] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`h-screen flex ${theme === "dark" ? "bg-[#111b21]" : "bg-[#e5ddd5]"
        }`}
    >
      {/* ================= SIDEBAR ================= */}
      {(!isMobile || !selectedContact) && <Sidebar />}

      {/* ================= CHAT AREA ================= */}
      {(!isMobile || selectedContact) && (
        <div className="flex-1 flex">

          {/* ✅ CHAT LIST */}
          {showChatList && (
            <div className="w-[320px] border-r border-gray-700">
              <ChatLists />
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
                  // ✅ PASS STATE
                  showChatList={showChatList}
                  setShowChatList={setShowChatList}
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