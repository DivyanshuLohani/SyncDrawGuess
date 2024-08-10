import { useEffect, useRef, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent, Player } from "../types";
import playerGuessAudio from "../sounds/playerGuess.wav";

enum MessageType {
  Guess = "guess",
  PlayerLeft = "playerLeft",
  PlayerJoin = "playerJoin",
  WordGuessed = "wordGuessed",
  GuessClose = "guessClose",
  Error = "error",
}
interface IMessage {
  sender: string;
  message: string;
  type: MessageType;
}

const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const messagesBottomDiv = useRef<HTMLDivElement | null>(null);
  const playerGuess = new Audio(playerGuessAudio);

  function addMessageToChat(message: string, player: Player) {
    setMessages([
      ...messages,
      { sender: player.name, message, type: MessageType.Guess },
    ]);
  }

  function addPlayerJoinMessage(player: Player) {
    setMessages([
      ...messages,
      { sender: player.name, message: "", type: MessageType.PlayerJoin },
    ]);
  }
  function addPlayerLeftMessage(player: Player) {
    setMessages([
      ...messages,
      { sender: player.name, message: "", type: MessageType.PlayerLeft },
    ]);
  }
  function addErrorMessage(message: string) {
    setMessages([
      ...messages,
      { sender: "", message, type: MessageType.Error },
    ]);
  }

  function addGuessedMessage(player: Player) {
    playerGuess.play();
    setMessages([
      ...messages,
      {
        sender: player.name,
        message: "has guessed the word",
        type: MessageType.WordGuessed,
      },
    ]);
  }

  useEffect(() => {
    socket.on(GameEvent.GUESS, addMessageToChat);
    socket.on(GameEvent.GUESSED, addGuessedMessage);
    socket.on(GameEvent.PLAYER_JOINED, addPlayerJoinMessage);
    socket.on(GameEvent.PLAYER_LEFT, addPlayerLeftMessage);
    socket.on(GameEvent.GUESSED, addGuessedMessage);
    socket.on("error", addErrorMessage);

    return () => {
      socket.off(GameEvent.GUESS, addMessageToChat);
      socket.off(GameEvent.PLAYER_JOINED, addPlayerJoinMessage);
      socket.off(GameEvent.PLAYER_LEFT, addPlayerLeftMessage);
      socket.off(GameEvent.GUESSED, addGuessedMessage);

      socket.off("error", addErrorMessage);
    };
  });

  const handleSend = () => {
    if (message.trim()) {
      socket.emit(GameEvent.GUESS, { guess: message });
      setMessage("");
    }
  };

  const scrollToBottom = () => {
    if (!messagesBottomDiv || !messagesBottomDiv.current) return;
    messagesBottomDiv.current.scrollTop =
      messagesBottomDiv.current?.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-1/4 bg-white p-4 shadow-md border-l border-gray-300">
      <h2 className="text-xl font-semibold mb-4">Chat</h2>
      <div className="h-80 overflow-y-auto mb-4" ref={messagesBottomDiv}>
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex"
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <button className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-md">
          Send
        </button>
      </form>
    </div>
  );
};

const Message = ({ message }: { message: IMessage }) => {
  let content = (
    <>
      <b>{message.sender}</b> <span>{message.message}</span>
    </>
  );
  let bgColor = "bg-white";

  switch (message.type) {
    case MessageType.PlayerJoin:
      bgColor = " bg-gray-100";
      content = (
        <span className="text-green-500">{message.sender} joined the game</span>
      );
      break;
    case MessageType.PlayerLeft:
      bgColor = " bg-gray-100";

      content = (
        <span className="text-red-500 bg-gray-100">
          {message.sender} left the game
        </span>
      );
      break;
    case MessageType.Error:
      bgColor = " bg-gray-100";

      content = (
        <span className="text-red-500 bg-gray-100">{message.message}</span>
      );
      break;

    case MessageType.WordGuessed:
      bgColor = " bg-gray-100";
      content = (
        <span className="text-green-500">
          <b>{message.sender}</b> has guessed the word
        </span>
      );
      break;
    case MessageType.GuessClose:
      bgColor = " bg-gray-100";
      content = (
        <span className="text-yellow-900 bg-gray-100">
          '{message.message}' is close
        </span>
      );
      break;
    default:
      break;
  }

  return <div className={`mb-1 rounded-md ${bgColor}`}>{content}</div>;
};

export default Chat;
