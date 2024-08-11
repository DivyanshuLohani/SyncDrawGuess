import React, { useEffect, useState } from "react";
import { GameEvent, SettingValue } from "../types";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";

const GameSettings: React.FC = () => {
  const { settings, creator, currentRound } = useRoom();
  const [isOpen, setIsOpen] = useState<boolean>(currentRound === 0);
  // State for settings
  const [numPlayers, setNumPlayers] = useState<number>(settings.players);
  const [drawingTime, setDrawingTime] = useState<number>(settings.drawTime);
  const [rounds, setRounds] = useState<number>(settings.rounds);
  const { changeSetting } = useRoom();

  useEffect(() => {
    function handleSettingChange(setting: SettingValue, value: number) {
      changeSetting(setting, value.toString());
      switch (setting) {
        case SettingValue.players:
          setNumPlayers(value);
          break;
        case SettingValue.drawTime:
          setDrawingTime(value);
          break;
        case SettingValue.rounds:
          setRounds(value);
          break;

        default:
          break;
      }
    }
    socket.on(GameEvent.SETTINGS_CHANGED, handleSettingChange);
    socket.on(GameEvent.GAME_STARTED, onClose);
    socket.on(GameEvent.GAME_ENDED, handleEnd);

    return () => {
      socket.off(GameEvent.SETTINGS_CHANGED, handleSettingChange);
      socket.off(GameEvent.GAME_STARTED, onClose);
      socket.off(GameEvent.GAME_ENDED, handleEnd);
    };
  });

  function onClose() {
    setIsOpen(false);
  }

  // Handlers
  const handleNumPlayersChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (socket.id != creator) return;

    setNumPlayers(parseInt(event.target.value, 10));
    socket.emit(
      GameEvent.CHANGE_SETTIING,
      SettingValue.players,
      event.target.value
    );
  };

  const handleDrawingTimeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (socket.id != creator) return;

    setDrawingTime(parseInt(event.target.value, 10));
    socket.emit(
      GameEvent.CHANGE_SETTIING,
      SettingValue.drawTime,
      event.target.value
    );
  };

  const handleRoundsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (socket.id != creator) return;

    setRounds(parseInt(event.target.value, 10));
    socket.emit(
      GameEvent.CHANGE_SETTIING,
      SettingValue.rounds,
      parseInt(event.target.value)
    );
  };
  const isOwner = creator === socket.id;

  const handleStart = () => {
    if (socket.id != creator) return;
    socket.emit(GameEvent.START_GAME);
  };

  const handleEnd = () => {
    setTimeout(() => {
      setIsOpen(true);
    }, 10000);
  };

  if (!isOpen) return null;
  return (
    <div className="absolute top-0 left-0 bg-black w-full h-full bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Game Settings</h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <label
              htmlFor="numPlayers"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of Players
            </label>
            <select
              id="numPlayers"
              value={numPlayers}
              onChange={handleNumPlayersChange}
              disabled={!isOwner}
              className="w-1/2 p-2 border border-gray-300 rounded-md disabled:hover:cursor-not-allowed hover:cursor-pointer"
            >
              {[...Array(7)].map((_, i) => (
                <option key={i + 2} value={i + 2}>
                  {i + 2}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between">
            <label
              htmlFor="drawingTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Drawing Time (seconds)
            </label>
            <select
              id="drawingTime"
              value={drawingTime}
              onChange={handleDrawingTimeChange}
              disabled={!isOwner}
              className="w-1/2 p-2 border border-gray-300 rounded-md disabled:hover:cursor-not-allowed hover:cursor-pointer"
            >
              {[...Array(23)].map((_, i) => (
                <option key={i * 10 + 20} value={i * 10 + 20}>
                  {i * 10 + 20}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between">
            <label
              htmlFor="rounds"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of Rounds
            </label>
            <select
              id="rounds"
              value={rounds}
              onChange={handleRoundsChange}
              disabled={!isOwner}
              className="w-1/2 p-2 border border-gray-300 rounded-md disabled:hover:cursor-not-allowed hover:cursor-pointer"
            >
              {[...Array(8)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleStart}
            className="py-2 px-4 w-full bg-blue-500 disabled:bg-blue-400 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 disabled:hover:bg-blue-400 disabled:hover:cursor-not-allowed transition-colors duration-100"
            disabled={!isOwner}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSettings;
