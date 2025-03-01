import io from "socket.io-client";

export const socket = io("http://192.168.29.63:8000", {
  autoConnect: false,
});
