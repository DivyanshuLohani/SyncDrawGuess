import * as redis from "redis";
import { promisify } from "util";
import { Room } from "../types";
import { configDotenv } from "dotenv";
configDotenv();

const client = redis.createClient({
  url: process.env.REDDIS_URL,
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

client.connect().then(() => {
  console.log("Connect to redis");
});

const ROOM_PREFIX = "room:";
const PUBLIC_ROOM_PREFIX = "publicRoom:";

export async function getRedisRoom(roomId: string): Promise<Room | null> {
  let data = await client.get(`${ROOM_PREFIX}${roomId}`);
  if (!data) data = await client.get(`${PUBLIC_ROOM_PREFIX}${roomId}`);
  return data ? JSON.parse(data) : null;
}

export async function setRedisRoom(roomId: string, roomData: Room) {
  if (roomData.isPrivate) {
    await client.set(`${ROOM_PREFIX}${roomId}`, JSON.stringify(roomData));
  } else {
    await client.set(
      `${PUBLIC_ROOM_PREFIX}${roomId}`,
      JSON.stringify(roomData)
    );
  }
}

export async function deleteRedisRoom(roomId: string) {
  await client.del(`${ROOM_PREFIX}${roomId}`);
}

export async function getPublicRooms() {
  let data = await client.keys(`${PUBLIC_ROOM_PREFIX}*`);
  if (!data) return [];
  return data.map((e) => e.replace(PUBLIC_ROOM_PREFIX, ""));
}
