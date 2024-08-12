import React, { useState } from "react";
import { useRoom } from "../context/RoomContext";

const RoomLink: React.FC = () => {
  const { roomId } = useRoom();
  const [text, setText] = useState(`Copy Join Link`);

  return (
    <div className="flex justify-center items-center bg-gray-100 z-50">
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Join Room</h1>
        <p className="text-lg mb-4">
          Click the button below to copy the room link:
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              window.location.href + `?roomId=${roomId}`
            );
            setText("Copied.");
            setTimeout(() => setText(`Copy Join Link`), 2000);
          }}
          className="inline-block py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 w-full"
        >
          {text}
        </button>
      </div>
    </div>
  );
};

export default RoomLink;
