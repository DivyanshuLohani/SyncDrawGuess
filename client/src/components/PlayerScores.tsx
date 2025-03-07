import React, { useEffect, useState } from "react";
import { GameEvent, Player, Room } from "../types";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import PlayerCard from "./Player/PlayerCard";

const PlayerScores: React.FC = () => {
  const { currentRound, settings, players } = useRoom();
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
    <div className="w-2/4 sm:w-[300px] overflow-x-hidden  h-[400px] sm:h-[650px] ">
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
              <PlayerCard key={player.playerId} player={player} index={index} />
            ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
};
export default PlayerScores;
