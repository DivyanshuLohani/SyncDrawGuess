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
  GameState,
  Languages,
  Player,
  Room,
  RoomState,
  Settings,
  SettingValue,
} from "../types";
import { socket } from "../socketHandler";

interface RoomContextValue {
  roomId: string;
  players: Player[];
  creator: string | null;
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
  roomState: RoomState;
  isPrivateRoom: boolean;
  mutePlayer: (playerId: string) => void;
  removeMute: (playerId: string) => void;
  mutedPlayers: string[];
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
      roomState: RoomState.NOT_STARTED,
      timerStartedAt: new Date(),
      hintLetters: [],
    },
    settings: {
      players: 0,
      drawTime: 0,
      rounds: 0,
      onlyCustomWords: false,
      customWords: [],
      wordCount: 0,
      hints: 0,
      language: Languages.en,
    },
    isPrivate: false,
  });
  const [myTurn, setIsmyTrun] = useState(false);
  const [me, setMe] = useState<Player | null>(null);
  const [roomState, setRoomState] = useState<RoomState>(RoomState.NOT_STARTED);
  const [mutedPlayers, setMutedPlayers] = useState<string[]>([]);

  useEffect(() => {
    console.log(myTurn);
  }, [myTurn]);

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
    setRoomState(RoomState.GUESSED);
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

  function wordChosen() {
    setRoomState(RoomState.DRAWING);
  }

  function choseWord() {
    setRoomState(RoomState.PLAYER_CHOOSE_WORD);
  }
  function choosingWord() {
    setRoomState(RoomState.CHOOSING_WORD);
  }

  function gameStarted(room: Room) {
    const cP = room.players[room.gameState.currentPlayer] || null;
    if (cP && socket.id === cP.playerId) setIsmyTrun(true);
    else setIsmyTrun(false);
    joinedRoom(room);
  }

  function gameEnded({ room, time }: { room: Room; time: number }) {
    setRoomState(RoomState.WINNER);
    setTimeout(() => {
      setRoomState(RoomState.NOT_STARTED);
    }, time * 1000);
    joinedRoom(room);
  }

  function updateGameState({ gameState }: { gameState: GameState }) {
    setRoom((p) => {
      return { ...p, gameState };
    });
    setRoomState(gameState.roomState);
  }

  function mutePlayer(playerId: string) {
    setMutedPlayers((prevMutedPlayers) => [...prevMutedPlayers, playerId]);
  }
  function removeMute(playerId: string) {
    setMutedPlayers((prevMutedPlayers) =>
      prevMutedPlayers.filter((id) => id !== playerId)
    );
  }

  useEffect(() => {
    socket.on(GameEvent.JOINED_ROOM, joinedRoom);
    socket.on(GameEvent.WORD_CHOSEN, wordChosen);
    socket.on(GameEvent.TURN_END, setTurn);
    socket.on(GameEvent.GAME_STARTED, gameStarted);
    socket.on(GameEvent.GAME_ENDED, gameEnded);
    socket.on(GameEvent.PLAYER_JOINED, addPlayer);
    socket.on(GameEvent.PLAYER_LEFT, removePlayer);
    socket.on(GameEvent.CHOOSE_WORD, choseWord);
    socket.on(GameEvent.GUESS_WORD_CHOSEN, wordChosen);
    socket.on(GameEvent.CHOOSING_WORD, choosingWord);
    socket.on(GameEvent.GAME_STATE, updateGameState);

    return () => {
      socket.off(GameEvent.JOINED_ROOM, joinedRoom);
      socket.off(GameEvent.GAME_STARTED, gameStarted);
      socket.off(GameEvent.GAME_ENDED, gameEnded);
      socket.off(GameEvent.TURN_END, setTurn);
      socket.off(GameEvent.PLAYER_JOINED, addPlayer);
      socket.off(GameEvent.PLAYER_LEFT, removePlayer);
      socket.off(GameEvent.WORD_CHOSEN, wordChosen);
      socket.off(GameEvent.GUESS_WORD_CHOSEN, wordChosen);
      socket.off(GameEvent.CHOOSE_WORD, choseWord);
      socket.off(GameEvent.CHOOSING_WORD, choosingWord);
      socket.off(GameEvent.GAME_STATE, updateGameState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    roomState: roomState,
    isPrivateRoom: room.isPrivate,
    mutePlayer,
    removeMute,
    mutedPlayers,
  };

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
