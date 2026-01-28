import { createClient } from "redis";

const enabled = (process.env.REDIS_ENABLED || "false").toLowerCase() === "true";

let client;

export function getRedisClient() {
  if (!enabled) {
    console.log("Redis disabled, not starting.");
    return null;
  }

  if (client) {
    return client;
  }

  const url = process.env.REDIS_URL;

  client = createClient({ url });
  client.on("error", (err) => console.error("[Redis] error:", err));

  return client;
}

export async function startRedis() {
  const c = getRedisClient();
  if (!c) {
    return;
  }

  if (!c.isOpen) {
    await c.connect();
    console.log("[Redis] connected");
  }
}

export async function stopRedis() {
  if (!client) {
    return;
  }

  if (client.isOpen) {
    await client.quit();
    console.log("[Redis] disconnected");
  }

  client = undefined;
}
