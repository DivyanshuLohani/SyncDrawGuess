import React from "react";
import GameHeader from "./Header";

const GameCanvas: React.FC = () => {
  return (
    <div className="flex-1 bg-gray-100 p-4 flex flex-col">
      <GameHeader timer={"10"} word={"word"} />
      <div className="flex-1 flex items-center justify-center mt-4">
        <div className="w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <canvas
            id="gameCanvas"
            height={600}
            width={800}
            // Placeholder for the actual canvas drawing logic
          ></canvas>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
