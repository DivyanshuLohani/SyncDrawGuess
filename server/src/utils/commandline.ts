import readline from "readline";
import { Server } from "socket.io";
import { deletePublicRooms } from "./redis";

export function setupCommandLine(io: Server) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", (input) => {
    const args = input.trim().split(" ");
    const command = args[0];

    switch (command) {
      case "broadcast":
        const message = args.slice(1).join(" ");
        io.emit("message", message);
        console.log(`Broadcasted message: ${message}`);
        break;
      case "stats":
        console.log(`Connected Clients: ${io.engine.clientsCount}`);
        break;
      case "clear":
        deletePublicRooms();
        break;
      case "exit":
        console.log("Shutting down server...");
        process.exit(0);
      default:
        console.log("Unknown command");
    }
  });
}
