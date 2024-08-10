import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { DrawData, GameEvent, Player, Room, Settings } from "../types";
import { socket } from "../socketHandler";

interface RoomContextValue {
  roomId: string;
  players: Player[];
  currentPlayer: Player | null;
  currentRound: number;
  drawingData: DrawData[];
  guessedWords: string[];
  word: string;
  settings: Settings;
  setRoom: (room: Room) => void; // Optional: function to update the room context
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

  useEffect(() => {
    socket.on(GameEvent.JOINED_ROOM, setRoom);
    socket.on(GameEvent.TURN_END, setRoom);
    socket.on(GameEvent.PLAYER_JOINED, addPlayer);
    socket.on(GameEvent.PLAYER_LEFT, removePlayer);

    return () => {
      socket.off(GameEvent.JOINED_ROOM, setRoom);
      socket.off(GameEvent.TURN_END, setRoom);
      socket.off(GameEvent.PLAYER_JOINED, addPlayer);
      socket.off(GameEvent.PLAYER_LEFT, removePlayer);
    };
  }, []);

  const currentPlayer = room.players[room.gameState.currentPlayer] || null;

  const contextValue: RoomContextValue = {
    roomId: room.roomId,
    players: room.players,
    currentPlayer,
    currentRound: room.gameState.currentRound,
    drawingData: room.gameState.drawingData,
    guessedWords: room.gameState.guessedWords,
    word: room.gameState.word,
    settings: room.settings,
    setRoom: (newRoom: Room) => setRoom(newRoom),
  };

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
