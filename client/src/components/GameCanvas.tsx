import { useEffect, useRef, useState } from "react";
import { socket } from "../socketHandler";
import { DrawData, GameEvent, Room } from "../types";
import Toolbar from "./Toolbar";
import { useRoom } from "../context/RoomContext";

const GameCanvas = ({ room }: { room: Room }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lineWidth, setLineWidth] = useState<number>(5);
  const { myTurn } = useRoom();
  const [color, setColor] = useState<string>("#000000");
  let drawing = false;
  const drawData = useRef<DrawData[]>(room.gameState.drawingData);

  function loadDrawData() {
    drawData.current.forEach((data) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.lineWidth = data.lineWidth;
        ctx.lineCap = "round";
        ctx.strokeStyle = data.color;
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        if (data.end) ctx.beginPath();
      }
    });
  }

  function getCoords(event: MouseEvent | TouchEvent) {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const point = "touches" in event ? event.touches[0] : event;
    return {
      x: ((point.clientX - rect.left) * canvasRef.current.width) / rect.width,
      y: ((point.clientY - rect.top) * canvasRef.current.height) / rect.height,
    };
  }

  function startDrawing(event: MouseEvent | TouchEvent) {
    if (!myTurn) return;
    drawing = true;
    const { x, y } = getCoords(event);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    event.preventDefault();
  }

  function draw(event: MouseEvent | TouchEvent) {
    if (!drawing || !canvasRef.current) return;
    const { x, y } = getCoords(event);
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.strokeStyle = color;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    event.preventDefault();
    socket.emit(GameEvent.DRAW, { x, y, color, lineWidth });
    drawData.current.push({ x, y, color, lineWidth, end: false });
  }

  function stopDrawing() {
    if (!drawing) return;
    drawing = false;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.beginPath();
    if (drawData.current.length > 0) {
      const lastDrawData = drawData.current[drawData.current.length - 1];
      lastDrawData.end = true;
      socket.emit(GameEvent.DRAW, lastDrawData);
    }
  }

  function revieveDrawData(data: DrawData) {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.lineWidth = data.lineWidth;
      ctx.lineCap = "round";
      ctx.strokeStyle = data.color;
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
      if (data.end) ctx.beginPath();
    }
  }

  function clearCanvas() {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }

  function handleUndo() {
    if (drawData.current.length === 0) return;
    // TODO: Update this part in server
    drawData.current.pop();
    while (drawData.current.length > 0) {
      const data = drawData.current.pop();
      if (data?.end) break;
    }
    if (drawData.current.length != 0) {
      drawData.current[drawData.current.length - 1].end = true;
    }
    clearCanvas();
    loadDrawData();
  }

  useEffect(() => {
    socket.on(GameEvent.JOINED_ROOM, loadDrawData);
    socket.on(GameEvent.DRAW_DATA, revieveDrawData);
    socket.on(GameEvent.WORD_CHOSEN, clearCanvas);
    socket.on(GameEvent.CLEAR_DRAW, clearCanvas);
    socket.on(GameEvent.UNDO_DRAW, clearCanvas);
    return () => {
      socket.off(GameEvent.JOINED_ROOM, loadDrawData);

      socket.off(GameEvent.DRAW_DATA, revieveDrawData);
      socket.off(GameEvent.WORD_CHOSEN, clearCanvas);
      socket.off(GameEvent.CLEAR_DRAW, clearCanvas);
      socket.off(GameEvent.UNDO_DRAW, clearCanvas);
    };
  }, []);

  return (
    <>
      <div id="game-canvas">
        <canvas
          className="bg-white"
          ref={canvasRef}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onMouseDown={(e: any) => startDrawing(e)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onTouchStart={(e: any) => startDrawing(e)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onMouseMove={(e: any) => draw(e)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onTouchMove={(e: any) => draw(e)}
          onMouseUp={stopDrawing}
          onTouchEnd={stopDrawing}
          width={800}
          height={600}
        />
      </div>

      <Toolbar
        onLineWidthChange={setLineWidth}
        onColorChange={setColor}
        handleUndo={handleUndo}
        handleClear={clearCanvas}
      />
    </>
  );
};

export default GameCanvas;
