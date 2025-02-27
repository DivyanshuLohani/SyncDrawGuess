import { useEffect, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent } from "../types";
import Button from "./ui/Button";
import { Dices } from "lucide-react";

export default function JoinGameForm() {
  const [name, setName] = useState<string>("");
  const [color, setColor] = useState<string>("#000000");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Function to get query parameters from the URL
    const queryParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = queryParams.get("roomId");
    if (roomIdFromUrl) {
      setRoomId(roomIdFromUrl);
    }
    socket.on("error", setError);

    return () => {
      socket.off("error", setError);
    };
  }, []);

  const handleJoin = (isPrivate: boolean = false) => {
    if (name.trim() === "") {
      alert("Please enter your name");
      return;
    }

    if (!socket.connected) socket.connect();
    socket.emit(
      GameEvent.JOIN_ROOM,
      { name, color },
      roomId ?? undefined,
      isPrivate
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="bg-primary-500 p-6 rounded-2xl shadow-lg w-96 text-center">
        {/* Name Input & Language Selector */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="flex-1 p-2 text-lg border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <select className="p-2 text-lg border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>

        {/* Avatar */}
        <div className="flex justify-center items-center relative mb-4">
          <div className="bg-yellow-500 p-4 rounded-lg text-4xl">😎</div>
          <Dices className="absolute top-0 right-0 text-white text-2xl cursor-pointer" />
        </div>

        {/* Play Button */}
        <Button
          variant="success"
          size="lg"
          fullWidth
          onClick={() => handleJoin(false)}
        >
          Play!
        </Button>

        {/* Create Private Room Button */}
        <Button
          variant="info"
          size="lg"
          fullWidth
          className="mt-3"
          onClick={() => handleJoin(true)}
        >
          Create Private Room
        </Button>
      </div>
    </div>
  );
}
