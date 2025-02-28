import React, { useEffect, useState } from "react";
import { GameEvent, Languages, Settings, SettingValue } from "../types";
import { socket } from "../socketHandler";
import { useRoom } from "../context/RoomContext";
import RoomLink from "./RoomLink";
import Button from "./ui/Button";
import {
  Clock,
  Gamepad2,
  Globe,
  Lightbulb,
  RotateCw,
  Users,
} from "lucide-react";

const GameSettings: React.FC = () => {
  const { settings, creator, currentRound, changeSetting } = useRoom();
  const [isOpen, setIsOpen] = useState<boolean>(currentRound === 0);
  // State for settings
  const [gameSettings, setGameSettings] = useState<Settings>(settings);
  const [customWords, setCustomWords] = useState<string>(
    settings.customWords.join(",")
  );

  useEffect(() => {
    function handleSettingChange(setting: SettingValue, value: number) {
      changeSetting(setting, value.toString());
      switch (setting) {
        case SettingValue.players:
          setGameSettings({ ...gameSettings, players: value });
          break;
        case SettingValue.drawTime:
          setGameSettings({ ...gameSettings, drawTime: value });
          break;
        case SettingValue.rounds:
          setGameSettings({ ...gameSettings, rounds: value });
          break;
        case SettingValue.wordCount:
          setGameSettings({ ...gameSettings, wordCount: value });
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

    setGameSettings({
      ...gameSettings,
      players: parseInt(event.target.value, 10),
    });
    socket.emit(
      GameEvent.CHANGE_SETTIING,
      SettingValue.players,
      parseInt(event.target.value, 10)
    );
  };

  const handleDrawingTimeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (socket.id != creator) return;

    setGameSettings({
      ...gameSettings,
      drawTime: parseInt(event.target.value, 10),
    });
    socket.emit(
      GameEvent.CHANGE_SETTIING,
      SettingValue.drawTime,
      parseInt(event.target.value, 10)
    );
  };

  const handleRoundsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (socket.id != creator) return;

    setGameSettings({
      ...gameSettings,
      rounds: parseInt(event.target.value, 10),
    });
    socket.emit(
      GameEvent.CHANGE_SETTIING,
      SettingValue.rounds,
      parseInt(event.target.value)
    );
  };

  const handleWordsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (socket.id != creator) return;

    setGameSettings({
      ...gameSettings,
      wordCount: parseInt(event.target.value, 10),
    });
    socket.emit(
      GameEvent.CHANGE_SETTIING,
      SettingValue.wordCount,
      parseInt(event.target.value)
    );
  };
  const handleCustomWordsOnly = () => {
    if (socket.id != creator) return;
    const customWordsOnly = !gameSettings.onlyCustomWords;
    setGameSettings({
      ...gameSettings,
      onlyCustomWords: !gameSettings.onlyCustomWords,
    });
    socket.emit(
      GameEvent.CHANGE_SETTIING,
      SettingValue.onlyCustomWords,
      customWordsOnly
    );
  };
  const isOwner = creator === socket.id;

  const handleStart = () => {
    if (socket.id != creator) return;
    socket.emit(GameEvent.START_GAME, {
      words: customWords.split(",").map((w) => w.trim()),
    });
  };

  const handleHints = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (socket.id != creator) return;

    setGameSettings({
      ...gameSettings,
      hints: parseInt(event.target.value, 10),
    });
    socket.emit(
      GameEvent.CHANGE_SETTIING,
      SettingValue.hints,
      parseInt(event.target.value)
    );
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (socket.id != creator) return;

    setGameSettings({
      ...gameSettings,
      language: event.target.value as Languages,
    });
    socket.emit(
      GameEvent.CHANGE_SETTIING,
      SettingValue.language,
      event.target.value
    );
  };

  const handleEnd = ({ time }: { time: number }) => {
    setTimeout(() => {
      setIsOpen(true);
    }, time * 1000);
  };

  const settingsOptions = [
    {
      label: "Players",
      value: gameSettings.players,
      setter: handleNumPlayersChange,
      icon: <Users size={18} />,
      options: [...Array(7)].map((_, i) => {
        return { value: i + 2, label: i + 2 };
      }),
    },
    {
      label: "Language",
      value: gameSettings.language,
      setter: handleLanguageChange,
      icon: <Globe size={18} />,
      options: Object.entries(Languages).map(([key, val]) => ({
        value: val,
        label: new Intl.DisplayNames(["en"], {
          type: "language",
        }).of(key.replace(/_/g, " ")),
      })),
    },
    {
      label: "Drawtime",
      value: gameSettings.drawTime,
      setter: handleDrawingTimeChange,
      icon: <Clock size={18} />,
      options: [...Array(23)].map((_, i) => {
        return { value: i * 10 + 20, label: i * 10 + 20 };
      }),
    },
    {
      label: "Rounds",
      value: gameSettings.rounds,
      setter: handleRoundsChange,
      icon: <RotateCw size={18} />,
      options: [...Array(8)].map((_, i) => {
        return { value: i + 1, label: i + 1 };
      }),
    },
    // { label: "Game Mode", value: gameMode, setter: setGameMode, icon: <Gamepad2 size={18} />, options: ["Normal", "Hard"] },
    {
      label: "Word Count",
      value: gameSettings.wordCount,
      setter: handleWordsChange,
      icon: <Gamepad2 size={18} />,
      options: [...Array(5)].map((_, i) => {
        return { value: i + 1, label: i + 1 };
      }),
    },
    {
      label: "Hints",
      value: gameSettings.hints,
      setter: handleHints,
      icon: <Lightbulb size={18} />,
      options: [...Array(3)].map((_, i) => {
        return { value: i + 1, label: i + 1 };
      }),
    },
  ];

  if (!isOpen) return null;
  return (
    <div className="w-full h-full p-2 sm:p-6">
      <div className="sm:space-y-2 flex flex-col flex-wrap">
        {settingsOptions.map((item, index) => {
          return (
            <div className="flex justify-between items-center" key={index}>
              <label
                htmlFor={item.label}
                className="block text-sm font-medium text-gray-200 mb-1"
              >
                <div className="flex gap-2">
                  {item.icon}
                  {item.label}
                </div>
              </label>
              <select
                id={item.label}
                value={item.value}
                onChange={item.setter}
                disabled={!isOwner}
                className="w-1/2 p-1 sm:p-2 border border-gray-300 rounded-md disabled:hover:cursor-not-allowed hover:cursor-pointer"
              >
                {item.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        <div className="flex justify-between items-center">
          <label
            htmlFor="custom-words"
            className="block text-sm font-medium text-gray-200 mb-1"
          >
            Custom Words
          </label>
          <div className="flex items-center">
            <label
              htmlFor="custom-words-only"
              className="text-sm font-medium text-gray-200 ml-2 cursor-pointer"
            >
              Use only custom words
            </label>
            <input
              type="checkbox"
              id="custom-words-only"
              className="ml-1 p-2 border border-gray-300 rounded-md disabled:hover:cursor-not-allowed hover:cursor-pointer"
              disabled={!isOwner}
              checked={gameSettings.onlyCustomWords}
              onChange={handleCustomWordsOnly}
            />
          </div>
        </div>
        <textarea
          name="words-input"
          className="w-full border rounded-lg p-2 outline-none"
          id=""
          placeholder="Type words separated by commas, maximum 2000 characters"
          value={customWords}
          onChange={(e) => setCustomWords(e.target.value)}
          disabled={!isOwner}
          maxLength={2000}
          rows={5}
        ></textarea>
        {/* <CustomWordsInput /> */}
      </div>
      <div className="sm:mt-2 flex gap-5 justify-end">
        <Button
          onClick={handleStart}
          className="w-3/5"
          disabled={!isOwner}
          variant="success"
        >
          Start
        </Button>
        <RoomLink />
      </div>
    </div>
  );
};

export default GameSettings;
