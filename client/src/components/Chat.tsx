import { useEffect, useRef, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent, Player, Room } from "../types";

interface Message {
  sender: string;
  message: string;
}

const Chat = ({ room }: { room: Room }) => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesBottomDiv = useRef<HTMLDivElement | null>(null);

  function addMessageToChat(message: string, player: Player) {
    setMessages([...messages, { sender: player.name, message }]);
  }

  useEffect(() => {
    socket.on(GameEvent.GUESS, addMessageToChat);

    return () => {
      socket.off(GameEvent.GUESS, addMessageToChat);
    };
  });

  const handleSend = () => {
    if (message.trim()) {
      socket.emit(GameEvent.GUESS, { roomId: room.roomId, guess: message });
      setMessage("");
    }
  };

  const scrollToBottom = () => {
    if (!messagesBottomDiv || !messagesBottomDiv.current) return;
    messagesBottomDiv.current.scrollTop =
      messagesBottomDiv.current?.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-1/4 bg-white p-4 shadow-md border-l border-gray-300">
      <h2 className="text-xl font-semibold mb-4">Chat</h2>
      <div className="h-80 overflow-y-auto mb-4" ref={messagesBottomDiv}>
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <b>{msg.sender}:</b> <span>{msg.message}</span>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex"
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <button className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-md">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
