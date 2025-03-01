export enum GameEvent {
  // CLient Events
  CONNECT = "connect",
  DISCONNECT = "disconnecting",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  START_GAME = "startGame",
  DRAW = "draw",
  DRAW_CLEAR = "clear",
  DRAW_UNDO = "undo",
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
  CLEAR_DRAW = "clearDraw",
  UNDO_DRAW = "undoDraw",
  GUESSED = "guessed",
  TURN_END = "turnEnded",
  CHOOSE_WORD = "chooseWord",
  CHOOSING_WORD = "choosingWord",
  WORD_CHOSEN = "wordChosen",
  GUESS_WORD_CHOSEN = "guessWordChosen",
  SETTINGS_CHANGED = "settingsChanged",
  GUESS_FAIL = "guessFail",
  GUESS_HINT = "guessHint",
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
  x: number;
  y: number;
  color: string;
  lineWidth: number;
  end: boolean;
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
  language: Languages;
  wordCount: number;
  hints: number;
}

export enum Languages {
  en = "English",
  es = "Spanish",
  fr = "French",
  de = "German",
  it = "Italian",
  nl = "Dutch",
  pt = "Portuguese",
  ru = "Russian",
  tr = "Turkish",
  zh = "Chinese",
}

export enum SettingValue {
  players = "players",
  drawTime = "drawTime",
  rounds = "rounds",
  onlyCustomWords = "onlyCustomWords",
  customWords = "customWords",
  language = "language",
  wordCount = "wordCount",
  hints = "hints",
}

export interface Room {
  roomId: string; // Unique identifier for the room
  creator: string; // Player ID of the creator of the room
  players: Player[]; // List of players in the room
  gameState: GameState; // Current state of the game
  settings: Settings;
}

export enum RoomState {
  NOT_STARTED = "NOT_STARTED",
  PLAYER_CHOOSE_WORD = "PLAYER_CHOOSE_WORD",
  CHOOSING_WORD = "CHOOSING_WORD",
  DRAWING = "DRAWING",
  GUESSED = "GUESSED",
  TIMEUP = "TIMEUP",
  WINNER = "WINNER",
}

export type EndTurnData = {
  word: string;
  reason: string;
  time: number;
};
