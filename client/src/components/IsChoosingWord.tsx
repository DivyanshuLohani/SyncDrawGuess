import { useEffect, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent } from "../types";

export default function IsChoosingWord() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function show() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  useEffect(() => {
    socket.on(GameEvent.GAME_STARTED, show);
    socket.on(GameEvent.TURN_END, show);
    socket.on(GameEvent.WORD_CHOSEN, close);
    return () => {
      socket.off(GameEvent.GAME_STARTED, show);
      socket.off(GameEvent.TURN_END, show);
      socket.off(GameEvent.WORD_CHOSEN, close);
    };
  });
  if (!isOpen) return;

  return (
    <div className="absolute top-0 left-0 bg-black w-full h-full bg-opacity-50 flex items-center justify-center z-50 gap-5">
      <span className="font-bold text-white text-2xl">
        Wait for player to choose a word
      </span>
    </div>
  );
}
