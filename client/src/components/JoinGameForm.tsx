import { useEffect, useState } from "react";
import { socket } from "../socketHandler";

export default function JoinGameForm() {
  const [name, setName] = useState<string>("");
  const [color, setColor] = useState<string>("#000000");
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Function to get query parameters from the URL
    const queryParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = queryParams.get("roomId");
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
    }
  }, []);

  const handleJoin = () => {
    if (name.trim() === "") {
      alert("Please enter your name");
      return;
    }

    socket.emit("joinRoom", { name, color }, roomId ?? undefined);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Join the Game</h1>
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Choose Your Color
          </label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full border border-gray-300 rounded-md"
          />
        </div>
        <button
          onClick={handleJoin}
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600"
        >
          Join Game
        </button>
      </div>
    </div>
  );
}
