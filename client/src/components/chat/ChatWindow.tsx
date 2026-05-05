import useLayoutStore from "../../store/useLayoutStore";

const ChatWindow = () => {
  const selectedContact = useLayoutStore(
    (state) => state.selectedContact
  );

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