import Redis from "ioredis";
const config = require("../config");

interface IMyClient {
  tget: (key: string) => Promise<any>;
  tset: (key: string, value: any, seconds?: number) => Promise<any> | null;
}

type MyClient = Redis.Redis & IMyClient;

const { port, host, password } = config.redis;
// @ts-ignore
const client: MyClient = new Redis(port, host, password);
export const subClient = new Redis(port, host, password);
export const rClient = client;

client.tget = async function (key: string) {
  let data = await client.get(key);
  if (!data) return null;

  try {
    data = JSON.parse(data);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

client.tset = async function (key, value, seconds) {
  if (!value) return null;
  value = JSON.stringify(value);
  if (!seconds) {
    await client.set(key, value);
  } else {
    await client.set(key, value, "EX", seconds);
  }
};

//TODO 等我优化
// enable notify-keyspace-events for all kind of events (can be refined)
// client.config("SET", "notify-keyspace-events", "KEA");
// subClient.subscribe("__keyevent@0__:set", "im:rooms");
// subClient.on('message', function(channel, key) {
// 竟然会受到所有key的
//   console.log('redis~~~%%%', channel, key);
// });

export default client;
