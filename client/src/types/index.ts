export enum GameEvent {
  // CLient Events
  CONNECT = "connect",
  DISCONNECT = "disconnecting",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  START_GAME = "startGame",
  DRAW = "draw",
  GUESS = "guess",
  CHANGE_SETTIING = "changeSettings",
  WORD_SELECT = "wordSelect",

  // Server Events
  JOINED_ROOM = "joinedRoom",
  PLAYER_JOINED = "playerJoined",
  PLAYER_LEFT = "playerLeft",
  GAME_STARTED = "gameStarted",
  GAME_ENDED = "gameEnded",
  DRAW_DATA = "drawData",
  GUESSED = "guessed",
  TURN_END = "turnEnded",
  CHOOSE_WORD = "chooseWord",
  WORD_CHOSEN = "wordChosen",
  SETTINGS_CHANGED = "settingsChanged",
  GUESS_FAIL = "guessFail",
}

export interface PlayerData {
  name: string;
  color: string;
}

export interface Player extends PlayerData {
  playerId: string;
  score: number;
  guessed: boolean;
  guessedAt: Date | null;
}

export interface DrawData {
  brushColor: string;
  brushRadius: number;
  points: {
    x: number;
    y: number;
  }[];
}
export interface GameState {
  currentRound: number;
  drawingData: DrawData[];
  guessedWords: string[];
  word: string;
  currentPlayer: number;
}

export interface Settings {
  players: number;
  drawTime: number;
  rounds: number;
  onlyCustomWords: boolean;
  customWords: string[];
}

export enum SettingValue {
  players = "players",
  drawTime = "drawTime",
  rounds = "rounds",
  // onlyCustomWords: boolean;
  // customWords: string[];
}

export interface Room {
  roomId: string; // Unique identifier for the room
  creator: string; // Player ID of the creator of the room
  players: Player[]; // List of players in the room
  gameState: GameState; // Current state of the game
  settings: Settings;
}
