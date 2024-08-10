import React, { useEffect, useState } from "react";
import { GameEvent, Room } from "./types";
import { socket } from "./socketHandler";
import JoinGameForm from "./components/JoinGameForm";
import Game from "./components/Game";
import { RoomProvider } from "./context/RoomContext";

const Home: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null);

  function handleRoomJoin(room: Room) {
    setRoom(room);
  }

  useEffect(() => {
    function onConnect() {
      console.log("Connected to server");
    }

    function onDisconnect() {
      console.log("Disconnected from server");
    }

    socket.on("connect", onConnect);

    socket.on("disconnect", onDisconnect);

    socket.on(GameEvent.JOINED_ROOM, handleRoomJoin);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(GameEvent.JOINED_ROOM, handleRoomJoin);
    };
  }, []);

  return (
    <RoomProvider>
      {room ? <Game room={room} /> : <JoinGameForm />}
    </RoomProvider>
  );
};

export default Home;
