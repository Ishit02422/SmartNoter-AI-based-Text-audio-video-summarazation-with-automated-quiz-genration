import { config } from "dotenv";
import Redis, { createClient, RedisClientType } from "redis";
config();

export const redis = createClient({
  url: process.env.REDIS_URL,
  // password: process.env.REDIS_PASSWORD,
}) as RedisClientType;
