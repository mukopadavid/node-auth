const redis = require("redis");

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

client.on("error", function (err) {
  console.log(err.message);
});

//! emmitted once the connection to redis has been established
client.on("connect", function () {
  console.log("connection to redis has been established");
});

//! This event is emmitted once redis is ready to be used
client.on("ready", function () {
  console.log("Redis is ready to be used");
});

module.exports = client;
