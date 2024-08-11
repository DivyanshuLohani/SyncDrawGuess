import PlayerScores from "./PlayerScroes";
import GameCanvas from "./GameCanvas";
import Chat from "./Chat";
import { Room } from "../types";
import RoomLink from "./RoomLink";
import GameSettings from "./GameSettings";
import WordSelector from "./WordSelector";
import IsChoosingWord from "./Info";

const Game = ({ room }: { room: Room }) => {
  return (
    <div className="flex h-screen bg-gray-200 flex-col md:flex-row w-full">
      <PlayerScores players={room.players} />
      <div className="flex-1 flex flex-col relative">
        <GameCanvas room={room} />
        <GameSettings />
        <IsChoosingWord />
        <WordSelector />
        <RoomLink roomId={room.roomId} />
      </div>
      <Chat />
    </div>
  );
};

export default Game;
