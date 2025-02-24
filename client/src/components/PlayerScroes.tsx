import React, { useEffect, useState } from "react";
import { GameEvent, Player, Room } from "../types";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";
import { CrownIcon, Users } from "lucide-react";
import clsx from "clsx";

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
    <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-1 rounded-xl shadow-lg border-2 border-primary-400 h-full">
      <h2 className="text-lg sm:text-2xl font-bold mb-4 text-primary-700 flex items-center gap-3 p-2">
        <Users className="mt-2" />
        <span>Players</span>
      </h2>

      {currentRound > 0 && (
        <p className="text-center text-primary-400 font-semibold mt-2 bg-background-paper rounded-lg py-1">
          Round {currentRound} of {settings.rounds}
        </p>
      )}
      <ul className="mt-4 space-y-2">
        {displayers
          .sort((a, b) => b.score - a.score)
          .map((player, index) => (
            <div
              className={clsx(
                "flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow gap-5",
                {
                  "bg-primary-100": player.playerId === currentPlayer?.playerId,
                }
              )}
              key={player.playerId}
            >
              <div className="font-bold">
                <span>#{index + 1} </span>
                {player.playerId === creator && (
                  <CrownIcon className="text-gray-500 mr-2" size={20} />
                )}
              </div>
              <div className="flex-1">
                <span className="text-primary truncate font-bold text-sm sm:text-base">
                  {player.name}
                </span>
                <p className="text-xs text-gray-500">{player.score} points</p>
              </div>
              <img src={""} alt="avatar" className="w-8 h-8 rounded-md" />
            </div>
          ))}
      </ul>
    </div>
  );
};
export default PlayerScores;
