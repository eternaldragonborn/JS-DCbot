//const { SlashCommandBuilder } = require('@discordjs/builders');
const { SlashCommand, CommandOptio, SlashCommandnType } = require('slash-create')
const slashCommand = require('../../../base/slashCommand');
const name = 'ping';


class ping extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: name,
            description: 'just a ping command',
            guildIDs: '719132687897591808'
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        await ctx.reply({ content: 'pong', ephemeral: true });
        //throw Error("test");
    }
}

module.exports = ping;