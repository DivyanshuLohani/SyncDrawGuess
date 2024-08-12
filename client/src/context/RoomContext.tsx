import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DrawData,
  GameEvent,
  Player,
  Room,
  Settings,
  SettingValue,
} from "../types";
import { socket } from "../socketHandler";

interface RoomContextValue {
  roomId: string;
  players: Player[];
  creator: string;
  currentPlayer: Player | null;
  currentRound: number;
  drawingData: DrawData[];
  guessedWords: string[];
  word: string;
  settings: Settings;
  changeSetting: (setting: SettingValue, value: string) => void;
  setRoom: (room: Room) => void; // Optional: function to update the room context
  myTurn: boolean;
  me: Player | null;
}
const RoomContext = createContext<RoomContextValue | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [room, setRoom] = useState<Room>({
    roomId: "",
    creator: "",
    players: [],
    gameState: {
      currentRound: 0,
      drawingData: [],
      guessedWords: [],
      word: "",
      currentPlayer: 0,
    },
    settings: {
      players: 0,
      drawTime: 0,
      rounds: 0,
      onlyCustomWords: false,
      customWords: [],
    },
  });
  const [myTurn, setIsmyTrun] = useState(true);
  const [me, setMe] = useState<Player | null>(null);

  function addPlayer(player: Player) {
    setRoom((p) => {
      return { ...p, players: [...p.players, player] };
    });
  }
  function removePlayer(player: Player) {
    setRoom((p) => {
      return {
        ...p,
        players: p.players.filter((e) => e.playerId != player.playerId),
      };
    });
  }

  function setTurn(room: Room) {
    const cP = room.players[room.gameState.currentPlayer] || null;
    if (cP && socket.id === cP.playerId) setIsmyTrun(true);
    else setIsmyTrun(false);
    joinedRoom(room);
  }

  function changeSetting(setting: SettingValue, value: string) {
    const settings = room.settings;
    switch (setting) {
      case SettingValue.players:
        settings.players = parseInt(value);
        break;
      case SettingValue.drawTime:
        settings.drawTime = parseInt(value);
        break;
      case SettingValue.rounds:
        settings.rounds = parseInt(value);
        break;
      default:
        break;
    }
    setRoom({ ...room, settings });
  }
  function joinedRoom(room: Room) {
    setRoom(room);
    setMe(room.players.find((p) => p.playerId === socket.id) ?? null);
  }

  useEffect(() => {
    socket.on(GameEvent.JOINED_ROOM, joinedRoom);
    socket.on(GameEvent.TURN_END, setTurn);
    socket.on(GameEvent.GAME_STARTED, joinedRoom);
    socket.on(GameEvent.GAME_ENDED, joinedRoom);
    socket.on(GameEvent.PLAYER_JOINED, addPlayer);
    socket.on(GameEvent.PLAYER_LEFT, removePlayer);

    return () => {
      socket.off(GameEvent.JOINED_ROOM, joinedRoom);
      socket.off(GameEvent.GAME_STARTED, joinedRoom);
      socket.off(GameEvent.GAME_ENDED, joinedRoom);
      socket.off(GameEvent.TURN_END, setTurn);
      socket.off(GameEvent.PLAYER_JOINED, addPlayer);
      socket.off(GameEvent.PLAYER_LEFT, removePlayer);
    };
  }, []);

  const currentPlayer = room.players[room.gameState.currentPlayer] || null;

  const contextValue: RoomContextValue = {
    roomId: room.roomId,
    players: room.players,
    creator: room.creator,
    currentRound: room.gameState.currentRound,
    drawingData: room.gameState.drawingData,
    guessedWords: room.gameState.guessedWords,
    word: room.gameState.word,
    settings: room.settings,
    setRoom: (newRoom: Room) => setRoom(newRoom),
    currentPlayer,
    changeSetting,
    myTurn,
    me,
  };

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
