import * as redis from "redis";
import { promisify } from "util";
import { Room } from "../types";

const client = redis.createClient({
  url: "redis://localhost:6379",
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

client.connect().then(() => {
  console.log("Connect to redis");
});

const ROOM_PREFIX = "room:";
const PLAYER_PREFIX = "player:";

export async function getRoom(roomId: string): Promise<Room | null> {
  const data = await client.get(`${ROOM_PREFIX}${roomId}`);
  return data ? JSON.parse(data) : null;
}

export async function setRoom(roomId: string, roomData: any) {
  await client.set(`${ROOM_PREFIX}${roomId}`, JSON.stringify(roomData));
}

export async function deleteRoom(roomId: string) {
  await client.del(`${ROOM_PREFIX}${roomId}`);
}

export async function getPlayer(playerId: string) {
  const data = await client.get(`${PLAYER_PREFIX}${playerId}`);
  return data ? JSON.parse(data) : null;
}

export async function setPlayer(playerId: string, playerData: any) {
  await client.set(`${PLAYER_PREFIX}${playerId}`, JSON.stringify(playerData));
}

export async function deletePlayer(playerId: string) {
  await client.del(`${PLAYER_PREFIX}${playerId}`);
}
