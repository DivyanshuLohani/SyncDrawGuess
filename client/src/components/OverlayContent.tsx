import { useEffect, useState } from "react";
import GameSettings from "./GameSettings";
import { useRoom } from "../context/RoomContext";
import { EndTurnData, GameEvent, RoomState } from "../types";
import { socket } from "../socketHandler";
import ChoosingWord from "./Overlay/ChoosingWord";
import WordSelector from "./Overlay/WordSelector";
import Winners from "./Overlay/Winners";
import { AnimatePresence, motion } from "framer-motion";

export default function OverlayContent() {
  const { roomState } = useRoom();
  const [word, setWord] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);

  function choosableWords({ words }: { words: string[]; time: number }) {
    setWords(words);
  }

  useEffect(() => {
    socket.on(GameEvent.CHOOSE_WORD, choosableWords);
    return () => {
      socket.off(GameEvent.CHOOSE_WORD, choosableWords);
    };
  }, []);

  useEffect(() => {
    function handleWord(_: unknown, data: EndTurnData) {
      setWord(data.word);
    }
    socket.on(GameEvent.TURN_END, handleWord);

    return () => {
      socket.off(GameEvent.TURN_END, handleWord);
    };
  }, []);
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: roomState === RoomState.DRAWING ? 0 : 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`absolute w-full h-full bg-black/75 top-0 flex items-center justify-center  ${
        roomState === RoomState.DRAWING && "pointer-events-none"
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={roomState}
          initial={{ y: "-50%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "50%", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full h-full flex items-center justify-center"
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
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
