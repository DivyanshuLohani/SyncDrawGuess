import { useEffect, useState } from "react";
import { GameEvent, Room } from "../types";
import { socket } from "../socketHandler";

const GameHeader = ({ room }: { room: Room }) => {
  const [timer, setTimer] = useState<number>(room.settings.drawTime);
  const [word, setWord] = useState("");

  function initTimer(word?: string) {
    setTimer(room.settings.drawTime);
    setInterval(() => {
      if (timer > 0) {
        setTimer((e) => e - 1);
      }
    }, 1000);
    if (word) setWord(word);
  }

  function endTurn() {
    setWord("");
  }

  useEffect(() => {
    socket.on(GameEvent.WORD_CHOSEN, initTimer);
    socket.on(GameEvent.TURN_END, endTurn);
    return () => {
      socket.off(GameEvent.WORD_CHOSEN, initTimer);
      socket.off(GameEvent.TURN_END, endTurn);
    };
  });

  return (
    <div className="w-full bg-blue-500 text-white py-2 px-4 flex items-center justify-between">
      <span className="text-lg font-semibold">{timer}</span>
      <span className="text-xl font-bold items-self-center">{word}</span>
    </div>
  );
};

export default GameHeader;
