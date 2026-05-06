import useLayoutStore from "../store/useLayoutStore";
import useThemeStore from "../store/useThemeStore";
import { MessageCircle, CircleDot, Settings } from "lucide-react";

const SidebarIcons = () => {
  const { activeTab, setActivedTab } = useLayoutStore();
  const { theme } = useThemeStore();

  const menuItems = [
    { id: "chat", icon: MessageCircle },
    { id: "status", icon: CircleDot },
  ];

  return (
    <div
      className={`h-screen w-[70px] flex flex-col justify-between items-center py-4 border-r ${theme === "dark"
        ? "bg-[#202c33] border-gray-700"
        : "bg-gray-100 border-gray-300"
        }`}
    >
      {/* Top Icons */}
      <div className="flex flex-col gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => setActivedTab(item.id)}
              className={`p-3 rounded-full cursor-pointer transition ${activeTab === item.id
                ? "bg-green-500 text-white"
                : theme === "dark"
                  ? "text-gray-300 hover:bg-[#2a3942]"
                  : "text-gray-700 hover:bg-gray-300"
                }`}
            >
              <Icon size={22} />
            </div>
          );
        })}
      </div>

      {/* Bottom Icon (Settings) */}
      <div
        onClick={() => setActivedTab("setting")}
        className={`p-3 rounded-full cursor-pointer transition ${activeTab === "setting"
          ? "bg-green-500 text-white"
          : theme === "dark"
            ? "text-gray-300 hover:bg-[#2a3942]"
            : "text-gray-700 hover:bg-gray-300"
          }`}
      >
        <Settings size={22} />
      </div>
    </div>
  );
};

export default SidebarIcons;