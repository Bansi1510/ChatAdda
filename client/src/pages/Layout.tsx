import React, { useEffect, useState } from "react";
import useLayoutStore from "../store/useLayoutStore";
import useThemeStore from "../store/useThemeStore";
import ChatWindow from "../components/chat/ChatWindow";
import Sidebar from "./Sidebar";

type LayoutProps = {
  children?: React.ReactNode;
  isThemeDialogOpen: boolean;
  toggleThemeDialog: () => void;
  isStatusPreviewOpen: boolean;
  statusPreviewContent: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({
  children,
  isThemeDialogOpen,
  toggleThemeDialog,
  isStatusPreviewOpen,
  statusPreviewContent,
}) => {
  const selectedContact = useLayoutStore((state) => state.selectedContact);
  const setSelectedContact = useLayoutStore(
    (state) => state.setSelectedContact
  );

  const { theme } = useThemeStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
        <div className="flex-1 flex flex-col">

          {/* ===== HEADER ===== */}
          <div
            className={`h-16 flex items-center justify-between px-4 ${theme === "dark"
              ? "bg-[#202c33] text-white"
              : "bg-white text-black border-b"
              }`}
          >
            <div className="flex items-center gap-3">
              {/* Mobile Back */}
              {isMobile && selectedContact && (
                <button onClick={() => setSelectedContact(null)}>←</button>
              )}

              {/* Avatar */}
              <div className="w-10 h-10 bg-gray-400 rounded-full"></div>

              <div>
                <p className="font-medium">
                  {selectedContact || "No chat selected"}
                </p>
                <p
                  className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  online
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span>🔍</span>
              <span>⋮</span>
              <button onClick={toggleThemeDialog}>🎨</button>
            </div>
          </div>

          {/* ===== CHAT / CHILDREN ===== */}
          <div
            className={`flex-1 overflow-y-auto p-4 ${theme === "dark" ? "bg-[#0b141a]" : "bg-[#efeae2]"
              }`}
          >
            {selectedContact ? (
              children ? children : <ChatWindow selectedContact={selectedContact} setSelectedContact={setSelectedContact} isMobile={isMobile} />
            ) : (
              <div
                className={`h-full flex items-center justify-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                Select a chat to start messaging
              </div>
            )}
          </div>

          {/* ===== MESSAGE INPUT ===== */}
          {selectedContact && (
            <div
              className={`h-16 flex items-center px-4 gap-3 ${theme === "dark"
                ? "bg-[#202c33]"
                : "bg-white border-t"
                }`}
            >
              <span className="text-xl">😊</span>

              <input
                type="text"
                placeholder="Type a message"
                className={`flex-1 px-4 py-2 rounded-full outline-none ${theme === "dark"
                  ? "bg-[#2a3942] text-white"
                  : "bg-gray-100 text-black"
                  }`}
              />

              <span className="text-xl">🎤</span>
            </div>
          )}
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