import PlayerScores from "./PlayerScroes";
import GameCanvas from "./GameCanvas";
import Chat from "./Chat";
import { Room } from "../types";
import RoomLink from "./RoomLink";

const Game = ({ room }: { room: Room }) => {
  return (
    <div className="flex h-screen bg-gray-200">
      <PlayerScores players={room.players} />
      <div className="flex-1 flex flex-col">
        <GameCanvas />
        <RoomLink roomId={room.roomId} />
      </div>
      <Chat room={room} />
    </div>
  );
};

export default Game;
