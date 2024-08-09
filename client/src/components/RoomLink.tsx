import React from "react";

interface RoomLinkProps {
  roomId: string;
}

const RoomLink: React.FC<RoomLinkProps> = ({ roomId }) => {
  return (
    <div className="flex justify-center items-center bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Join Room</h1>
        <p className="text-lg mb-4">Click the link below to join the room:</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              window.location.href + `?roomId=${roomId}`
            );
          }}
          className="inline-block py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600"
        >
          Join Room {roomId}
        </button>
      </div>
    </div>
  );
};

export default RoomLink;
