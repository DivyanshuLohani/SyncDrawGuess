import { useEffect, useState } from "react";
import { GameEvent } from "../types";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";

const GameHeader = () => {
  const [word, setWord] = useState("");
  const [interval, startInterval] = useState<NodeJS.Timeout | null>(null);
  const { settings } = useRoom();
  const [timer, setTimer] = useState<number>(settings.drawTime);

  function initTimer(word?: string) {
    if (interval) clearInterval(interval);
    setTimer(settings.drawTime);
    startInterval(
      setInterval(() => {
        if (timer > 0) {
          setTimer((e) => (e > 0 ? e - 1 : e));
        }
      }, 1000)
    );

    if (word) setWord(word);
  }
  function initTimerForWord() {
    if (interval) clearInterval(interval);
    setTimer(30);

    startInterval(
      setInterval(() => {
        if (timer > 0) {
          setTimer((e) => (e > 0 ? e - 1 : e));
        }
      }, 1000)
    );
  }

  function endTurn() {
    setWord("");
    if (interval) clearInterval(interval);
  }

  useEffect(() => {
    socket.on(GameEvent.WORD_CHOSEN, initTimer);
    socket.on(GameEvent.CHOOSE_WORD, initTimerForWord);
    socket.on(GameEvent.TURN_END, endTurn);
    return () => {
      socket.off(GameEvent.WORD_CHOSEN, initTimer);
      socket.off(GameEvent.CHOOSE_WORD, initTimerForWord);
      socket.off(GameEvent.TURN_END, endTurn);
    };
  });

  return (
    <div className="w-full bg-blue-500 text-white py-2 px-4 flex items-center justify-between z-50">
      <span className="text-lg font-semibold">{timer}</span>
      <span className="text-xl font-bold items-self-center">{word}</span>
    </div>
  );
};

export default GameHeader;
