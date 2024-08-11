import { useEffect, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent, Room } from "../types";
import { useRoom } from "../context/RoomContext";

enum InfoState {
  WAITING = "waiting",
  TURN_END = "turnEnd",
  GAME_ENDED = "gameEnd",
}

export default function Scroes() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [word, setWord] = useState<string>("");
  const [displayStatus, setDisplayStatus] = useState<InfoState>(
    InfoState.TURN_END
  );
  const { currentPlayer, players } = useRoom();
  const [element, setElement] = useState<React.ReactNode>(<span></span>);
  const { currentRound, settings } = useRoom();

  useEffect(() => {
    switch (displayStatus) {
      case InfoState.WAITING:
        setElement(
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
        );
        break;
      case InfoState.TURN_END:
        setElement(
          <span className="font-bold text-white text-2xl">
            The word was <strong className="text-green-500">{word}</strong>
          </span>
        );
        break;
      case InfoState.GAME_ENDED:
        setElement(
          <div className="flex flex-col text-white w-1/2">
            <h3 className="text-2xl text-center font-bold mb-5">Game Ended</h3>
            <div className="flex flex-col">
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between w-full text-xl"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className="block w-4 h-4 rounded-full"
                        style={{ backgroundColor: player.color }}
                      ></span>
                      <span className="font-semibold">{player.name}</span>
                    </div>
                    <span className="font-medium">{player.score}</span>
                  </div>
                ))}
            </div>
          </div>
        );
        break;
    }
  }, [currentPlayer?.color, currentPlayer?.name, displayStatus, players, word]);

  function show() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function turnEnd(_room: Room, word: string) {
    setDisplayStatus(InfoState.TURN_END);
    setIsOpen(true);
    setWord(word);
    if (currentRound === settings.rounds) return;
    setTimeout(() => {
      setDisplayStatus(InfoState.WAITING);
    }, 5000);
  }

  function gameEnd() {
    setDisplayStatus(InfoState.GAME_ENDED);
    setIsOpen(true);
    setTimeout(() => {
      close();
    }, 10000);
  }

  useEffect(() => {
    socket.on(GameEvent.GAME_STARTED, show);
    socket.on(GameEvent.TURN_END, turnEnd);
    socket.on(GameEvent.WORD_CHOSEN, close);
    socket.on(GameEvent.CHOOSE_WORD, close);
    socket.on(GameEvent.GAME_ENDED, gameEnd);
    return () => {
      socket.off(GameEvent.GAME_STARTED, show);
      socket.off(GameEvent.TURN_END, turnEnd);
      socket.off(GameEvent.WORD_CHOSEN, close);
      socket.off(GameEvent.CHOOSE_WORD, close);
      socket.off(GameEvent.GAME_ENDED, gameEnd);
    };
  });
  if (!isOpen) return;

  return (
    <div className="absolute top-0 left-0 bg-black w-full h-full bg-opacity-50 flex items-center justify-center z-50 gap-5">
      {element}
    </div>
  );
}
