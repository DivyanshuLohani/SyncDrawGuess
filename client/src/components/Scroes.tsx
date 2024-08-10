import { useEffect, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent, Room } from "../types";
import { useRoom } from "../context/RoomContext";

export default function Scroes() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [word, setWord] = useState<string>("");
  const [waiting, setWaiting] = useState(true);
  const { currentPlayer } = useRoom();

  function show() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setWaiting(false);
  }

  function turnEnd(_room: Room, word: string) {
    setIsOpen(true);
    setWord(word);
    setTimeout(() => {
      setWaiting(true);
    }, 4000);
  }

  useEffect(() => {
    socket.on(GameEvent.GAME_STARTED, show);
    socket.on(GameEvent.TURN_END, turnEnd);
    socket.on(GameEvent.WORD_CHOSEN, close);
    socket.on(GameEvent.CHOOSE_WORD, close);
    return () => {
      socket.off(GameEvent.GAME_STARTED, show);
      socket.off(GameEvent.TURN_END, turnEnd);
      socket.off(GameEvent.WORD_CHOSEN, close);
      socket.off(GameEvent.CHOOSE_WORD, close);
    };
  });
  if (!isOpen) return;

  return (
    <div className="absolute top-0 left-0 bg-black w-full h-full bg-opacity-50 flex items-center justify-center z-50 gap-5">
      {waiting ? (
        <span className="font-bold text-white text-2xl">
          <span
            style={{
              color: currentPlayer?.color,
            }}
          >
            {currentPlayer?.name}
          </span>{" "}
          is choosing a word
        </span>
      ) : (
        <span className="font-bold text-white text-2xl">
          The word was <strong className="text-green-500">{word}</strong>
        </span>
      )}
    </div>
  );
}
