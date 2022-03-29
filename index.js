require('dotenv').config();
const { DragonBot } = require('./base/dragonBot');

const client = new DragonBot({
    intents: [32767],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;

client.init();

/* client.on('ready', () => {

}); */