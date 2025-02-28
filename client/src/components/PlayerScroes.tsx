import React, { useEffect, useState } from "react";
import { GameEvent, Player, Room } from "../types";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";
import { CrownIcon } from "lucide-react";
import clsx from "clsx";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

const PlayerScores: React.FC = () => {
  const { currentPlayer, currentRound, settings, creator, players } = useRoom();
  const [displayers, setDisplayers] = useState<Player[]>(players);

  function addPlayer(player: Player) {
    setDisplayers((p) => {
      if (player.playerId === socket.id) {
        return p;
      }
      return [...p, player];
    });
  }
  function removePlayer(player: Player) {
    setDisplayers((p) => {
      return p.filter((e) => e.playerId != player.playerId);
    });
  }

  function roundEnd(room: Room) {
    setDisplayers(room.players);
  }

  useEffect(() => {
    socket.on(GameEvent.PLAYER_JOINED, addPlayer);
    socket.on(GameEvent.PLAYER_LEFT, removePlayer);
    socket.on(GameEvent.TURN_END, roundEnd);

    return () => {
      socket.off(GameEvent.PLAYER_JOINED, addPlayer);
      socket.off(GameEvent.PLAYER_LEFT, removePlayer);
      socket.off(GameEvent.TURN_END, roundEnd);
    };
  });

  return (
    <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-sm shadow-lg border-2 border-primary-400 w-2/4 sm:w-[300px] overflow-x-hidden  h-[400px] sm:h-[650px] ">
      {/* <h2 className="text-lg sm:text-2xl font-bold mb-4 text-primary-700 flex items-center gap-3 p-2">
        <Users className="mt-2" />
        <span>Players</span>
      </h2> */}

      {currentRound > 0 && (
        <p className="text-center text-primary-400 font-semibold mt-2 bg-background-paper rounded-lg py-1">
          Round {currentRound} of {settings.rounds}
        </p>
      )}
      <motion.ul className="mt-1 space-y-1">
        <AnimatePresence>
          {displayers
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <motion.div
                className={clsx(
                  "relative flex w-full h-10 sm:h-16 p-1 rounded-lg overflow-hidden",
                  {
                    "bg-primary-100":
                      player.playerId === currentPlayer?.playerId,
                    "bg-white": player.playerId !== currentPlayer?.playerId,
                  }
                )}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                key={player.playerId}
              >
                <div className="font-bold text-xs sm:text-base ablsolute left-2 top-2 flex flex-col justify-center">
                  <span>#{index + 1} </span>
                  {player.playerId === creator && (
                    <CrownIcon className="text-gray-500 mr-2" size={20} />
                  )}
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
            ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
};
export default PlayerScores;
