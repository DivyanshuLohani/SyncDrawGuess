import { useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent } from "../types";

export default function GuessInput() {
  const [guess, setGuess] = useState<string>("");
  // const { currentPlayer, me, myTurn } = useRoom();
  const handleSend = () => {
    if (guess.trim()) {
      socket.emit(GameEvent.GUESS, { guess });
      setGuess("");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }}
      className="sm:hidden relative flex items-center"
    >
      <input
        className="w-full p-2 text-center "
        placeholder="Type your guess"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
      />
      {guess.length > 0 && (
        <span className="absolute right-2">{guess.length}</span>
      )}
    </form>
  );
}
