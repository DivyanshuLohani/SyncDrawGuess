import { useEffect, useState } from "react";
import GameSettings from "./GameSettings";
import { useRoom } from "../context/RoomContext";
import { GameEvent, RoomState } from "../types";
import { socket } from "../socketHandler";
import ChoosingWord from "./Overlay/ChoosingWord";
import WordSelector from "./Overlay/WordSelector";
import Winners from "./Overlay/Winners";

export default function OverlayContent() {
  const { roomState } = useRoom();
  const [word, setWord] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    socket.on(GameEvent.CHOOSE_WORD, setWords);
    // socket.on(GameEvent.WORD_CHOSEN, close);
    return () => {
      socket.off(GameEvent.CHOOSE_WORD, setWords);
      //   socket.off(GameEvent.WORD_CHOSEN, close);
    };
  }, []);

  useEffect(() => {
    function handleWord(_: unknown, word: string) {
      console.log(word);
      setWord(word);
    }
    socket.on(GameEvent.TURN_END, handleWord);

    return () => {
      socket.off(GameEvent.TURN_END, handleWord);
    };
  }, []);
  console.log(roomState);
  return (
    <div
      className={`absolute w-full h-full bg-black/75 top-0 flex items-center justify-center transition-transform duration-300 ${
        roomState === RoomState.DRAWING && "top-[-1000%] pointer-events-none"
      }`}
    >
      {roomState === RoomState.NOT_STARTED && <GameSettings />}
      {roomState === RoomState.CHOOSING_WORD && <ChoosingWord />}
      {roomState === RoomState.PLAYER_CHOOSE_WORD && (
        <WordSelector words={words} />
      )}
      {roomState === RoomState.WINNER && <Winners />}
      {roomState === RoomState.GUESSED && (
        <span className="font-bold text-white text-2xl">
          The word was <strong className="text-green-500">{word}</strong>
        </span>
      )}
    </div>
  );
}
