import React, { createContext, useEffect, useState } from "react";
import { EndTurnData, GameEvent, Player } from "../types";
import { socket } from "../socketHandler";
import { IMessage, MessageType } from "../components/Chat/Message";
import { useRoom } from "./RoomContext";

interface MessagesContextValue {
  messages: IMessage[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const MessageContext = createContext<MessagesContextValue | undefined>(
  undefined
);

export default function MessagesContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { currentPlayer, me, myTurn, mutedPlayers } = useRoom();

  function addMessageToChat(message: string, player: Player) {
    if (player.guessed && player.playerId != socket.id) return;
    if (mutedPlayers.includes(player.playerId)) return;
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

  function addWordWas(_: unknown, data: EndTurnData) {
    if (!currentPlayer) return;
    setMessages([
      ...messages,
      {
        sender: "",
        message: data.word,
        type: MessageType.WordWas,
      },
    ]);
  }

  function clearChat() {
    setMessages([]);
  }

  function handleVoteKicking({
    voter,
    player: votee,
    votes,
    votesNeeded,
  }: {
    voter: string;
    player: string;
    votes: number;
    votesNeeded: number;
  }) {
    setMessages([
      ...messages,
      {
        sender: "",
        message: `${voter} is voting to kick ${votee} (${votes}/${votesNeeded})`,
        type: MessageType.VoteKick,
      },
    ]);
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
    socket.on(GameEvent.KICKING_VOTE, handleVoteKicking);
    socket.on("error", addErrorMessage);

    return () => {
      socket.on(GameEvent.GAME_STARTED, clearChat);
      socket.off(GameEvent.GUESS, addMessageToChat);
      socket.off(GameEvent.PLAYER_JOINED, addPlayerJoinMessage);
      socket.off(GameEvent.PLAYER_LEFT, addPlayerLeftMessage);
      socket.off(GameEvent.GUESSED, addGuessedMessage);
      socket.off(GameEvent.WORD_CHOSEN, addWordChosen);
      socket.off(GameEvent.TURN_END, addWordWas);
      socket.on(GameEvent.KICKING_VOTE, handleVoteKicking);
      socket.off("error", addErrorMessage);
    };
  });

  return (
    <MessageContext.Provider
      value={{
        messages,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}
