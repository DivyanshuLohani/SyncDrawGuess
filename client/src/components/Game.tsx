import PlayerScores from "./PlayerScroes";
import GameCanvas from "./GameCanvas";
import Chat from "./Chat";
import { Room } from "../types";
import GameHeader from "./Header";
import useIsMobile from "../hooks/useIsMobile";
import OverlayContent from "./OverlayContent";

const Game = ({ room }: { room: Room }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col sm:flex-row">
      {!isMobile && <PlayerScores />}
      <div>
        <GameHeader />
        <div className="relative">
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
