import { motion } from "framer-motion";

// eslint-disable-next-line react-refresh/only-export-components
export enum MessageType {
  Guess = "guess",
  PlayerLeft = "playerLeft",
  PlayerJoin = "playerJoin",
  WordGuessed = "wordGuessed",
  GuessClose = "guessClose",
  WordChoosen = "wordChosen",
  WordWas = "wordWas",
  Error = "error",
  VoteKick = "voteKick",
}
export interface IMessage {
  sender: string;
  message: string;
  type: MessageType;
}

export const Message = ({ message }: { message: IMessage }) => {
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
    case MessageType.VoteKick:
      bgClass = "bg-neutral-100";
      content = <span className="text-error-main">{message.message}</span>;
      break;
    default:
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`mb-1 p-1 sm:p-0 sm:px-2 sm:py-1 rounded-md ${bgClass} transition-colors duration-200 text-sm sm:text-base`}
    >
      {content}
    </motion.div>
  );
};
export default Message;
