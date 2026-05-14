import React from "react";
import useThemeStore from "../../store/useThemeStore";
import useUserStore from "../../store/useUserStore";
import useLayoutStore from "../../store/useLayoutStore";
import { logout } from "../../services/user.service";
import { toast } from "react-toastify";
import {
  MessageCircle,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";

const Settings: React.FC = () => {
  const { theme } = useThemeStore();
  const { user, clearUser } = useUserStore();
  const setActivedTab = useLayoutStore(
    (state) => state.setActivedTab
  );

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      toast.success("Logged out");
    } catch (error) {
      console.log(error);
      toast.error("Logout failed");
    }
  };
  console.log(user)
  const menuClass = `
    flex items-center justify-between
    px-4 py-4 cursor-pointer transition
    border-b
    ${theme === "dark"
      ? "border-[#2a3942] hover:bg-[#202c33] text-white"
      : "border-gray-200 hover:bg-gray-100 text-black"
    }
  `;

  return (
    <div
      className={`h-full flex flex-col ${theme === "dark"
        ? "bg-[#111b21]"
        : "bg-white"
        }`}
    >
      {/* Header */}
      <div
        className={`px-4 py-5 border-b ${theme === "dark"
          ? "border-[#2a3942] text-white"
          : "border-gray-200 text-black"
          }`}
      >
        <h1 className="text-2xl font-semibold">
          Settings
        </h1>

        <div className="mt-4 flex items-center gap-3">
          {user?.profilePictures ? (
            <img
              src={user.profilePictures}
              alt={user.username}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h2 className="font-medium text-lg">
              {user?.username}
            </h2>

            <p className="text-sm text-gray-400">
              Available
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1">
        {/* Chats */}
        <div
          onClick={() => setActivedTab("chat")}
          className={menuClass}
        >
          <div className="flex items-center gap-3">
            <MessageCircle size={22} />
            <span>Chats</span>
          </div>

          <ChevronRight size={18} />
        </div>

        {/* Profile */}
        <div className={menuClass}>
          <div className="flex items-center gap-3">
            <User size={22} />
            <span>Profile</span>
          </div>

          <ChevronRight size={18} />
        </div>

        {/* Logout */}
        <div
          onClick={handleLogout}
          className={menuClass}
        >
          <div className="flex items-center gap-3 text-red-500">
            <LogOut size={22} />
            <span>Logout</span>
          </div>

          <ChevronRight
            size={18}
            className="text-red-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;