import { useEffect, useRef, useState } from "react";
import GameHeader from "./Header";
import { socket } from "../socketHandler";
import { DrawData, GameEvent, Room } from "../types";
import Toolbar from "./Toolbar";
import CanvasDraw from "react-canvas-draw";
import { useRoom } from "../context/RoomContext";

const GameCanvas = ({ room }: { room: Room }) => {
  const canvasRef = useRef<CanvasDraw>(null);
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [color, setColor] = useState<string>("#000000");
  const [drawData, setDrawData] = useState<DrawData[]>(
    room.gameState.drawingData
  );

  const { myTurn: ismyTurn } = useRoom();

  function draw(data: DrawData) {
    if (!canvasRef || !canvasRef.current) return;
    setDrawData((p) => [...p, data]);
  }

  function undo() {
    if (!canvasRef || !canvasRef.current) return;
    canvasRef.current.undo();
  }
  function clear() {
    if (!canvasRef || !canvasRef.current) return;
    canvasRef.current.clear();
    setDrawData([]);
  }

  useEffect(() => {
    socket.on(GameEvent.DRAW_DATA, draw);
    socket.on(GameEvent.TURN_END, clear);

    return () => {
      socket.off(GameEvent.DRAW_DATA, draw);
      socket.off(GameEvent.TURN_END, clear);
    };
  });

  useEffect(() => {
    const fData = { width: 800, height: 600, lines: [...drawData] };
    canvasRef.current?.loadSaveData(JSON.stringify(fData), true);
  }, [drawData]);

  return (
    <div className="flex-1 bg-gray-100 p-4 flex flex-col">
      <GameHeader />
      <div className="flex-1 flex items-center justify-center mt-4">
        <div className="w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <CanvasDraw
            ref={canvasRef}
            onChange={(e) => {
              const data = JSON.parse(e.getSaveData()).lines;
              if (ismyTurn) socket.emit(GameEvent.DRAW, data[data.length - 1]);
            }}
            disabled={!ismyTurn}
            brushColor={color}
            brushRadius={lineWidth}
            canvasWidth={800}
            canvasHeight={600}
            className="border border-gray-300"
            hideInterface={!ismyTurn}
          />
          <Toolbar
            onLineWidthChange={setLineWidth}
            onColorChange={setColor}
            handleUndo={undo}
            // handleClear={clear}
          />
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
