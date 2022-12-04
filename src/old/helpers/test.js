require("dotenv").config("../.dev.env");
const { MongoClient, ServerApiVersion } = require("mongodb");

const mongoPWD = encodeURIComponent(process.env.MONGO_PWD);
const database = encodeURIComponent("Fafnir-Database");
const uri = `mongodb://EternalDragonborn:${mongoPWD}@localhost:27017/?authSource=admin`;
const mongo = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

/**
 * @type { import("./types").Message[] }
 */
const datas = [
  {
    _id: "上香",
    pattern: "[^http].*([＼／\\|/l]s?){3}|上香|:021:|:034:|:GIF009:",
    reaction: [
      { type: "string", source: "<:021:685800580958126081>" },
      { type: "string", source: "<:02:839488926296440863>" },
      { type: "string", source: "<:034:835896289970880552>" },
      { type: "string", source: "<:3_:839186971678867507>" },
      { type: "string", source: "<a:GIF009:752531101276176425>" },
    ],
  },
];

async function writeData() {
  const client = await mongo.connect();
  try {
    const collection = client.db("message-reaction").collection("messageEvent");

    await collection.insertMany(data).then(() => console.log("data writed"));
  } catch (err) {
    console.log(err.message);
  } finally {
    await client.close();
  }
}

writeData();
