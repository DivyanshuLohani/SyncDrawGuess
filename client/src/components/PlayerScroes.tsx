import React, { useEffect, useState } from "react";
import { GameEvent, Player, Room } from "../types";
import { socket } from "../socketHandler";
import joinAudio from "../sounds/playerJoin.wav";
import leaveAudio from "../sounds/playerLeft.wav";

interface PlayerScoresProps {
  players: Player[];
}

const PlayerScores: React.FC<PlayerScoresProps> = ({ players }) => {
  const playerJoinAudio = new Audio(joinAudio);
  const playerLeftAudio = new Audio(leaveAudio);

  const [displayers, setDisplayers] = useState<Player[]>(players);

  function addPlayer(player: Player) {
    setDisplayers((p) => {
      return [...p, player];
    });
    playerJoinAudio.play();
  }
  function removePlayer(player: Player) {
    setDisplayers((p) => {
      return p.filter((e) => e.playerId != player.playerId);
    });

    playerLeftAudio.play();
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
    <div className="w-full md:w-1/4 bg-white p-4 shadow-md border-r border-gray-300">
      <h2 className="text-xl font-semibold mb-4">Players</h2>
      <div className="space-y-4">
        {displayers.map((player, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className="block w-4 h-4 rounded-full"
                style={{ backgroundColor: player.color }}
              ></span>
              <span className="font-medium">{player.name}</span>
            </div>
            <span className="font-medium">{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PlayerScores;
