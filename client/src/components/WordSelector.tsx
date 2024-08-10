import { useEffect, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent } from "../types";

export default function WordSelector() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [words, setWords] = useState<string[]>([]);

  function show(ws: string[]) {
    setIsOpen(true);
    setWords(ws);
  }

  function close() {
    setIsOpen(false);
    setWords([]);
  }

  function handleWordSelect(word: string) {
    setIsOpen(false);
    socket.emit(GameEvent.WORD_SELECT, word);
  }

  useEffect(() => {
    socket.on(GameEvent.CHOOSE_WORD, show);
    socket.on(GameEvent.WORD_CHOSEN, close);
    return () => {
      socket.off(GameEvent.WORD_CHOSEN, close);
      socket.off(GameEvent.CHOOSE_WORD, show);
    };
  });
  if (!isOpen) return;

  return (
    <div className="absolute top-0 left-0 bg-black w-full h-full bg-opacity-50 flex items-center justify-center z-50 gap-5">
      {words.map((e) => {
        return (
          <button
            onClick={() => handleWordSelect(e)}
            className="px-2 py-1 border-2 border-white rounded text-white font-bold text-2xl hover:bg-white hover:text-black duration-100"
            key={e}
          >
            {e}
          </button>
        );
      })}
    </div>
  );
}
