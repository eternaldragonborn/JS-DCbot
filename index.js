require('dotenv').config();
const { Intents, Client } = require('discord.js');
const DragonBot = require('./base/dragonBot');

const intents = new Intents(Intents.FLAGS.GUILDS && Intents.FLAGS.GUILD_MESSAGES);
const client = new DragonBot({ intents: intents });

client.login(process.env.DISCORD_TOKEN);



client.on('ready', () => {
    client.init();
    client.guilds.cache.get(client.setting.testGuild).channels.fetch('867831786255417365').then(channel => channel.send('bot online'));
});