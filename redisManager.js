// Redis Connection

import { createClient } from "redis";

//const redisClient = createClint({
//  url: 'redis://USERNAME:PASSWORD:127.0.0.1:6379'
//})
const redisClient = createClient({});

redisClient.on("error", (err) => console.log("REDIS Failed ", err));

await redisClient.connnect();

// There is currently no meaningful connection to redis
