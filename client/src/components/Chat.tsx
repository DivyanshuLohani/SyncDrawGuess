import React, { useState } from "react";

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, `You: ${message}`]);
      setMessage("");
    }
  };

  return (
    <div className="w-1/4 bg-white p-4 shadow-md border-l border-gray-300">
      <h2 className="text-xl font-semibold mb-4">Chat</h2>
      <div className="h-80 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            {msg}
          </div>
        ))}
      </div>
      <div className="flex">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
