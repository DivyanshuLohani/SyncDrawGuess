import { useEffect, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent, Languages, PlayerData } from "../types";
import Button from "./ui/Button";
import PlayerSelector from "./Player/PlayerSelector";

export default function JoinGameForm() {
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: localStorage.getItem("name") as string | "",
    appearance: [0, 0, 0],
  });
  const [language, setLanguage] = useState<Languages>(
    localStorage.getItem("language") as Languages | Languages.en
  );
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
    if (playerData.name.trim() === "") {
      alert("Please enter your name");
      return;
    }
    localStorage.setItem("name", playerData.name);
    localStorage.setItem("language", language);
    if (!socket.connected) socket.connect();
    socket.emit(
      GameEvent.JOIN_ROOM,
      playerData,
      language,
      roomId ?? undefined,
      isPrivate
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <span className="p-5 text-red-500">{error}</span>
      <div className="bg-primary-500 p-6 rounded-2xl shadow-lg text-center">
        {/* Name Input & Language Selector */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            name="name"
            value={playerData.name}
            onChange={(e) =>
              setPlayerData({ ...playerData, name: e.target.value })
            }
            placeholder="Enter your name"
            className="flex-1 p-2 text-lg border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <select
            className="p-2 text-lg border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Languages)}
          >
            {Object.entries(Languages).map(([key, value]) => {
              return (
                <option key={key} value={key}>
                  {value}
                </option>
              );
            })}
          </select>
        </div>

        <PlayerSelector />

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
