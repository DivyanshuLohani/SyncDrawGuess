import { useEffect, useState } from "react";
import { EndTurnData, GameEvent, Room } from "../types";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";

const GameHeader = () => {
  const [word, setWord] = useState<string | number[]>("");
  const [interval, startInterval] = useState<NodeJS.Timeout | null>(null);
  const { settings } = useRoom();
  const [timer, setTimer] = useState<number>(settings.drawTime);

  useEffect(() => {
    console.log("Timer", timer);
  }, [timer]);

  function initTimer({
    word,
    time,
  }: {
    word: string | number[];
    time: number;
  }) {
    if (interval) clearInterval(interval);
    setTimer(time);
    startInterval(
      setInterval(() => {
        setTimer((e) => (e > 0 ? e - 1 : e));
      }, 1000)
    );

    setWord(word);
  }
  function initTimerForWord({ time }: { time: number }) {
    if (interval) clearInterval(interval);
    setTimer(time);

    startInterval(
      setInterval(() => {
        setTimer((e) => (e > 0 ? e - 1 : e));
      }, 1000)
    );
  }

  function endTurn(_room: Room, data: EndTurnData) {
    setWord("");
    setTimer(data.time);
  }

  useEffect(() => {
    socket.on(GameEvent.WORD_CHOSEN, initTimer);
    socket.on(GameEvent.GUESS_WORD_CHOSEN, initTimer);
    socket.on(GameEvent.CHOOSE_WORD, initTimerForWord);
    socket.on(GameEvent.CHOOSING_WORD, initTimerForWord);
    socket.on(GameEvent.TURN_END, endTurn);
    socket.on(GameEvent.GAME_ENDED, endTurn);
    return () => {
      socket.off(GameEvent.WORD_CHOSEN, initTimer);
      socket.off(GameEvent.GUESS_WORD_CHOSEN, initTimer);
      socket.off(GameEvent.CHOOSE_WORD, initTimerForWord);
      socket.off(GameEvent.CHOOSING_WORD, initTimerForWord);
      socket.off(GameEvent.TURN_END, endTurn);
      socket.off(GameEvent.GAME_ENDED, endTurn);
    };
  });

  return (
    <div className="w-full bg-background-paper rounded-lg text-primary font-bold py-2 px-4 flex items-center justify-between z-50  border-2 border-primary-400">
      <span className="text-lg font-semibold">{timer}</span>
      <span className="text-xl font-bold text-center flex gap-5">
        {typeof word === "string"
          ? word
          : word.map((n, i) => (
              <span className="relative" key={i}>
                {new Array(n).fill("_").join(" ")}{" "}
                <span className="text-xs -right-2 absolute">{n}</span>
              </span>
            ))}
      </span>
    </div>
  );
};

export default GameHeader;
