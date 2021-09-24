require('dotenv').config();
const { Intents, Client } = require('discord.js');
const DragonBot = require('./base/dragonBot');

//const intents = new Intents(Intents.FLAGS.GUILDS && Intents.FLAGS.GUILD_MESSAGES);
const client = new DragonBot({
    intents: [
        32767
        /* Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        //Intents.FLAGS.GUILD_VOICE_STATES, */
    ]
});

client.login(process.env.DISCORD_TOKEN);



client.on('ready', () => {
    client.init();
    //client.channels.resolve(this.Channel.startingLog).send('bot online');
    //client.testGuild.channels.fetch('867831786255417365').then(channel => channel.send('bot online'));
});