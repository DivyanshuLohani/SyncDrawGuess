import { useEffect, useRef, useState } from "react";
import { socket } from "../socketHandler";
import { GameEvent } from "../types";
import { SendIcon } from "lucide-react";
import Button from "./ui/Button";
import useIsMobile from "../hooks/useIsMobile";
import { AnimatePresence } from "framer-motion";
import Message from "./Chat/Message";
import useMessages from "../hooks/useMessages";
import { useRoom } from "../context/RoomContext";
import clsx from "clsx";

const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const messagesBottomDiv = useRef<HTMLDivElement | null>(null);
  const { messages } = useMessages();
  const { myTurn } = useRoom();

  const isMobile = useIsMobile();

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
    <div className="h-[400px] sm:h-[650px] bg-gradient-to-br from-primary-100 to-secondary-100 w-1/2 sm:w-auto ">
      {/* <h2 className="text-lg sm:text-2xl font-bold mb-4 text-primary-700 flex items-center gap-3 p-2">
        <MessageSquareMoreIcon className="mt-2" />
        <span>Chat</span>
      </h2> */}

      <div
        className={clsx(
          "h-[400px] sm:h-[600px] overflow-y-auto sm:p-4 bg-background rounded-lg border-2 border-dashed border-primary-300 transition-colors duration-200 scroll-smooth",
          {
            "sm:h-[715px]": myTurn,
          }
        )}
        ref={messagesBottomDiv}
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))}
        </AnimatePresence>
      </div>

      {!isMobile && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex relativeflex-col sm:flex-row bottom-0"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type something fun..."
            className="w-full p-3 pl-4 pr-12 border-2 border-primary-400 rounded-lg sm:rounded-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
          />
          <Button
            endIcon={<SendIcon />}
            onClick={handleSend}
            className="rounded-lg sm:rounded-sm"
            type="button"
          >
            {isMobile && "Send"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default Chat;
