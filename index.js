require('dotenv').config();
const DragonBot = require('./base/dragonBot');

const client = new DragonBot({
    intents: [32767]
});

client.init();

client.login(process.env.DISCORD_TOKEN);

/* client.on('ready', () => {

}); */