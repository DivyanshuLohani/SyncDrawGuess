import PlayerScores from "./PlayerScores";
import GameCanvas from "./GameCanvas";
import Chat from "./Chat";
import { Room } from "../types";
import GameHeader from "./Header";
import useIsMobile from "../hooks/useIsMobile";
import OverlayContent from "./OverlayContent";
import AudioManager from "./Audio/AudioManager";
import GuessInput from "./GuessInput";
import MessagesContext from "../context/MessagesContext";
import ToastStack from "./Overlay/ToastMessage";
import Logo from "./Logo";

const Game = ({ room }: { room: Room }) => {
  const isMobile = useIsMobile();

  return (
    <MessagesContext>
      <Logo />
      <GameHeader />
      <div className="flex flex-grow flex-col sm:flex-row justify-center w-full h-screen ">
        <AudioManager />
        <div className="flex-col">{!isMobile && <PlayerScores />}</div>
        <div>
          <div className="relative overflow-hidden">
            <GameCanvas room={room} />
            <OverlayContent />
            <ToastStack />
          </div>
        </div>
        <div className="flex-col">
          <GuessInput />
          <div className="flex">
            {isMobile && <PlayerScores />}
            <Chat />
          </div>
        </div>
      </div>
    </MessagesContext>
  );
};

export default Game;
