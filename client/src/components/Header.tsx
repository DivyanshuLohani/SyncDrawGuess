import React from "react";

interface GameHeaderProps {
  timer: string; // Time in a string format (e.g., "01:30")
  word: string; // The current word
}

const GameHeader: React.FC<GameHeaderProps> = ({ timer, word }) => {
  return (
    <div className="w-full bg-blue-500 text-white py-2 px-4 flex items-center justify-between">
      <span className="text-lg font-semibold">{timer}</span>
      <span className="text-xl font-bold items-self-center">{word}</span>
    </div>
  );
};

export default GameHeader;
