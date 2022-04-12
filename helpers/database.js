const redis = require("redis");
const { MongoClient, ServerApiVersion } = require("mongodb");

const client = redis.createClient({
  url: "redis://" + process.env["REDIS_HOST"],
  password: process.env["REDIS_PASSWD"],
});
client.connect();

const getRandomCode = (length) => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

const mongoPWD = encodeURIComponent(process.env.MONGO_PWD);
const database = encodeURIComponent("Fafnir-Database");
const uri = process.env.DEV_MODE
  ? `mongodb+srv://EternalDragonborn:${mongoPWD}@fafnir-database.tk85b.mongodb.net/${database}?retryWrites=true&w=majority`
  : `mongodb://EternalDragonborn:${mongoPWD}@localhost:27017/?authSource=admin`;
const mongo = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

module.exports = { redis: client, getRandomCode, mongo };
