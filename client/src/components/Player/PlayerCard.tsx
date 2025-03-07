import { GameEvent, Player } from "../../types";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useRoom } from "../../context/RoomContext";
import { CrownIcon, VolumeXIcon } from "lucide-react";
import { socket } from "../../socketHandler";
import Dialog from "../ui/Dialog";
import { useState } from "react";
import Button from "../ui/Button";
import RoomLink from "../RoomLink";

export default function PlayerCard({
  player,
  index,
}: {
  player: Player;
  index: number;
}) {
  const { currentPlayer, creator, mutePlayer, mutedPlayers, removeMute } =
    useRoom();
  const [isOpen, setIsOpen] = useState(false);
  const isPlayerSelf = player.playerId === socket.id;
  const isMuted = mutedPlayers.includes(player.playerId);

  const handleVoteKick = () => {
    socket.emit(GameEvent.VOTE_KICK, player.playerId);
    setIsOpen(false);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <motion.div
        className={clsx(
          "relative flex w-full h-10 sm:h-16 p-1 rounded-lg overflow-hidden",
          {
            "bg-primary-100": player.playerId === currentPlayer?.playerId,
            "bg-white": player.playerId !== currentPlayer?.playerId,
          }
        )}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        key={player.playerId}
        onClick={() => setIsOpen(true)}
      >
        <div className="font-bold text-xs sm:text-base ablsolute left-2 top-2 flex flex-col justify-center">
          <span>#{index + 1} </span>
          <div className="flex items-center">
            {player.playerId === creator && (
              <CrownIcon className="text-gray-500 mr-2" size={20} />
            )}
            {isMuted && (
              <VolumeXIcon className="text-gray-500 mr-2" size={20} />
            )}
          </div>
        </div>
        <div className="text-center absolute inset-0 flex items-center justify-center flex-col sm:-ml-4">
          <span className="text-primary truncate font-bold text-xs sm:text-base">
            {player.name} {player.playerId === socket.id && "(You)"}
          </span>
          <p className="text-xs text-gray-500">{player.score} points</p>
        </div>
        <div className="absolute right-0 h-full z-10 flex items-center">
          <img
            src={"/logo.png"}
            alt="avatar"
            className="w-10 h-10 sm:h-20 sm:w-20"
          />
        </div>
      </motion.div>
      <Dialog title={player.name} isOpen={isOpen} onClose={onClose}>
        {/* Avatar & Buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Avatar */}
          <img
            src={"/logo.png"}
            alt="Player Avatar"
            className="w-32 h-32 rounded-full border border-neutral-300 dark:border-neutral-600"
          />

          {/* Buttons */}
          <div className="flex flex-col gap-3 w-1/2">
            <>
              <RoomLink className="w-full" />
            </>
            {!isPlayerSelf && (
              <>
                <Button
                  size="md"
                  className="font-bold"
                  onClick={handleVoteKick}
                >
                  Vote Kick
                </Button>
                <Button
                  size="md"
                  onClick={() => {
                    if (isMuted) removeMute(player.playerId);
                    else mutePlayer(player.playerId);
                    onClose();
                  }}
                >
                  Mute
                </Button>
              </>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
