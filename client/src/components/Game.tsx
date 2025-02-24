import PlayerScores from "./PlayerScroes";
import GameCanvas from "./GameCanvas";
import Chat from "./Chat";
import { Room } from "../types";
import GameHeader from "./Header";
import useIsMobile from "../hooks/useIsMobile";
import OverlayContent from "./OverlayContent";
import AudioManager from "./Audio/AudioManager";

const Game = ({ room }: { room: Room }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-grow flex-col sm:flex-row justify-center w-full h-full">
      <AudioManager />
      <div className="flex-col">{!isMobile && <PlayerScores />}</div>
      <div>
        <GameHeader />
        <div className="relative overflow-hidden">
          <GameCanvas room={room} />
          <OverlayContent />
        </div>
      </div>

      <div className="flex">
        {isMobile && <PlayerScores />}
        <Chat />
      </div>
    </div>
  );
};

export default Game;
