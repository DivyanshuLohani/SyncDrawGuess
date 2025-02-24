import { useEffect, useRef, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent, Player } from "../types";
import { useRoom } from "../context/RoomContext";
import { MessageSquareMoreIcon, SendIcon } from "lucide-react";
import Button from "./ui/Button";
import useIsMobile from "../hooks/useIsMobile";

enum MessageType {
  Guess = "guess",
  PlayerLeft = "playerLeft",
  PlayerJoin = "playerJoin",
  WordGuessed = "wordGuessed",
  GuessClose = "guessClose",
  WordChoosen = "wordChosen",
  WordWas = "wordWas",
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
  const { currentPlayer, me, myTurn } = useRoom();
  const isMobile = useIsMobile();

  function addMessageToChat(message: string, player: Player) {
    if (player.guessed && player.playerId != socket.id) return;
    if (currentPlayer?.playerId === player.playerId && !myTurn) return;
    if (myTurn) {
      setMessages([
        ...messages,
        { sender: player.name, message, type: MessageType.GuessClose },
      ]);
    }
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
    setMessages([
      ...messages,
      {
        sender: player.name,
        message: "has guessed the word",
        type: MessageType.WordGuessed,
      },
    ]);
  }
  function addWordChosen() {
    if (!currentPlayer) return;
    setMessages([
      ...messages,
      {
        sender: currentPlayer.name,
        message: "is now drawing",
        type: MessageType.WordChoosen,
      },
    ]);
  }

  function addWordWas(_: unknown, word: string) {
    if (!currentPlayer) return;
    setMessages([
      ...messages,
      {
        sender: "",
        message: word,
        type: MessageType.WordWas,
      },
    ]);
  }

  function clearChat() {
    setMessages([]);
  }

  useEffect(() => {
    if (me) {
      addPlayerJoinMessage(me);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on(GameEvent.GAME_STARTED, clearChat);
    socket.on(GameEvent.GUESS, addMessageToChat);
    socket.on(GameEvent.GUESSED, addGuessedMessage);
    socket.on(GameEvent.PLAYER_JOINED, addPlayerJoinMessage);
    socket.on(GameEvent.PLAYER_LEFT, addPlayerLeftMessage);
    socket.on(GameEvent.GUESSED, addGuessedMessage);
    socket.on(GameEvent.WORD_CHOSEN, addWordChosen);
    socket.on(GameEvent.TURN_END, addWordWas);
    socket.on("error", addErrorMessage);

    return () => {
      socket.on(GameEvent.GAME_STARTED, clearChat);
      socket.off(GameEvent.GUESS, addMessageToChat);
      socket.off(GameEvent.PLAYER_JOINED, addPlayerJoinMessage);
      socket.off(GameEvent.PLAYER_LEFT, addPlayerLeftMessage);
      socket.off(GameEvent.GUESSED, addGuessedMessage);
      socket.off(GameEvent.WORD_CHOSEN, addWordChosen);
      socket.off(GameEvent.TURN_END, addWordWas);
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
    <div className="bg-gradient-to-br from-primary-100 to-secondary-100 p-1 rounded-xl shadow-lg border-2 border-primary-400 h-full relative">
      <h2 className="text-lg sm:text-2xl font-bold mb-4 text-primary-700 flex items-center gap-3 p-2">
        <MessageSquareMoreIcon className="mt-2" />
        <span>Chat</span>
      </h2>

      <div
        className="h-full max-h-screen overflow-y-auto mb-4 sm:p-4 bg-background rounded-lg border-2 border-dashed border-primary-300 transition-colors duration-200 "
        ref={messagesBottomDiv}
      >
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex relative gap-2 flex-col sm:flex-row bottom-0"
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type something fun..."
          className="w-full p-3 pl-4 pr-12 border-2 border-primary-400 rounded-lg sm:rounded-full font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
        />
        <Button
          endIcon={<SendIcon />}
          onClick={handleSend}
          className="rounded-lg sm:rounded-full"
          type="button"
        >
          {isMobile && "Send"}
        </Button>
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
  let bgClass = "bg-background-paper";

  switch (message.type) {
    case MessageType.PlayerJoin:
      bgClass = "bg-neutral-100";
      content = (
        <span className="text-success-main">
          {message.sender} joined the game
        </span>
      );
      break;
    case MessageType.PlayerLeft:
      bgClass = "bg-neutral-100";
      content = (
        <span className="text-error-main">{message.sender} left the game</span>
      );
      break;
    case MessageType.Error:
      bgClass = "bg-neutral-100";
      content = <span className="text-error-main">{message.message}</span>;
      break;
    case MessageType.WordGuessed:
      bgClass = "bg-neutral-100";
      content = (
        <span className="text-success-main">
          <b>{message.sender}</b> has guessed the word
        </span>
      );
      break;
    case MessageType.WordChoosen:
      bgClass = "bg-neutral-100";
      content = (
        <span className="text-success-main">
          <b>{message.sender}</b> {message.message}
        </span>
      );
      break;
    case MessageType.GuessClose:
      bgClass = "bg-neutral-100";
      content = (
        <span className="text-warning-dark">'{message.message}' is close</span>
      );
      break;
    case MessageType.WordWas:
      bgClass = "bg-neutral-100";
      content = (
        <span className="text-success-main">
          The word was '<b>{message.message}</b>'
        </span>
      );
      break;
    default:
      break;
  }

  return (
    <div
      className={`mb-1 px-2 py-1 rounded-md ${bgClass} transition-colors duration-200 text-sm sm:text-base`}
    >
      {content}
    </div>
  );
};
export default Chat;
