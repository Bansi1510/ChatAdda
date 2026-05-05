import useLayoutStore from "../store/useLayoutStore";
import useThemeStore from "../store/useThemeStore";

const Sidebar = () => {
  const selectedContact = useLayoutStore((state) => state.selectedContact);
  const setSelectedContact = useLayoutStore(
    (state) => state.setSelectedContact
  );

  const { theme } = useThemeStore();

  return (
    <div
      className={`w-full md:w-[30%] border-r ${theme === "dark"
          ? "bg-[#111b21] border-gray-700 text-white"
          : "bg-white border-gray-300 text-black"
        }`}
    >
      {/* Header */}
      <div
        className={`p-4 font-bold text-lg border-b ${theme === "dark" ? "border-gray-700" : "border-gray-300"
          }`}
      >
        Chats
      </div>

      {/* Contact List */}
      <div className="p-2 space-y-2">
        {[1, 2, 3, 4].map((c) => (
          <div
            key={c}
            onClick={() => setSelectedContact(String(c))}
            className={`p-3 rounded-lg cursor-pointer transition ${selectedContact === String(c)
                ? "bg-blue-500 text-white"
                : theme === "dark"
                  ? "hover:bg-[#202c33]"
                  : "hover:bg-gray-200"
              }`}
          >
            Contact {c}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;