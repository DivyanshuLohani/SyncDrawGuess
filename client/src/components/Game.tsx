import PlayerScores from "./PlayerScroes";
import GameCanvas from "./GameCanvas";
import Chat from "./Chat";
import { Room } from "../types";
import RoomLink from "./RoomLink";
import { useState } from "react";
import GameSettings from "./GameSettings";
import WordSelector from "./WordSelector";
import IsChoosingWord from "./IsChoosingWord";

const Game = ({ room }: { room: Room }) => {
  const [settingsOpen, setSettingsOpen] = useState<boolean>(
    room.gameState.currentRound === 0
  );

  const toggleSettings = () => {
    setSettingsOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-200 flex-col md:flex-row w-full">
      <PlayerScores players={room.players} />
      <div className="flex-1 flex flex-col relative">
        <GameCanvas room={room} />
        <GameSettings
          creator={room.creator}
          settings={room.settings}
          isOpen={settingsOpen}
          onClose={toggleSettings}
        />
        <IsChoosingWord />
        <WordSelector />
        <RoomLink roomId={room.roomId} />
      </div>
      <Chat />
    </div>
  );
};

export default Game;
