import * as redis from "redis";
import { Languages, Room } from "../types";
import { configDotenv } from "dotenv";
import { exec } from "child_process";

configDotenv();

const client = redis.createClient({
  url: process.env.REDDIS_URL,
});

client.on("error", (err) => {
  console.error("Redis error:", err);
  if (err.code === "ECONNREFUSED") {
    // Start a docker contianer of redis
    // startRedisContainer();
  }
});

client.connect().then(() => {
  console.log("Connect to redis");
});

const startRedisContainer = () => {
  exec("docker run -d redis", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting Redis container: ${error.message}`);
      process.exit(1);
    }
    if (stderr) {
      console.error(`Redis container stderr: ${stderr}`);
    }
    console.log(`Redis container started: ${stdout}`);
  });
};

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
  await client.del(`${PUBLIC_ROOM_PREFIX}${roomId}`);
  await client.del(`${ROOM_PREFIX}${roomId}`);
}

export async function getPublicRoom(
  language: Languages = Languages.en
): Promise<Room | null> {
  const rooms = await getPublicRooms();
  if (rooms.length <= 0) {
    return null;
  }

  for (const roomId of rooms) {
    const room = await getRedisRoom(roomId);
    if (!room) continue;
    if (
      room.players.length < room.settings.players &&
      room.settings.language === language
    ) {
      return room;
    }
  }
  return null;
}

export async function getPublicRooms() {
  let data = await client.keys(`${PUBLIC_ROOM_PREFIX}*`);
  if (!data) return [];
  return data.map((e) => e.replace(PUBLIC_ROOM_PREFIX, ""));
}

export async function deletePublicRooms() {
  const publicRooms = await client.keys(`${PUBLIC_ROOM_PREFIX}*`);
  if (publicRooms.length > 0) {
    await client.del([...publicRooms]);
    console.log(`Deleted ${publicRooms.length} public rooms`);
  } else {
    console.log("No public rooms to delete");
  }
}
