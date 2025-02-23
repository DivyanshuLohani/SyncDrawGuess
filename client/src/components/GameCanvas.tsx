import { useEffect, useRef, useState } from "react";
import { socket } from "../socketHandler";
import { DrawData, GameEvent, Room } from "../types";
import { useRoom } from "../context/RoomContext";
import Toolbar from "./Toolbar";

const GameCanvas = ({ room }: { room: Room }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    // canvasRef.current?.loadSaveData(JSON.stringify(fData), true);
  }, [drawData]);

  return (
    <>
      <div id="game-canvas">
        <canvas
          ref={canvasRef}
          onChange={(e) => {
            console.log(e);
          }}
          width={800}
          height={600}
        />
      </div>
      {ismyTurn && (
        <Toolbar
          onLineWidthChange={setLineWidth}
          onColorChange={setColor}
          handleUndo={undo}
          // handleClear={clear}
        />
      )}
    </>
  );
};

export default GameCanvas;
