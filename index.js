process.env.DEV_MODE
  ? require("dotenv").config({ path: "./.dev.env" })
  : require("dotenv").config();

console.log(process.env.REDIS_HOST);
const { DragonBot } = require("./base/dragonBot");

const client = new DragonBot({
  intents: [32767],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;

client.init();

/* client.on('ready', () => {

}); */
