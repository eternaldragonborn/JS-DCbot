const DragonBot = require('./dragonBot');
const { SlashCommandBuilder } = require('@discordjs/builders');

class slashCommand {
    /**
     *
     * @param { DragonBot } client
     * @param {{name: String; commandData: SlashCommandBuilder; ?enabled: Boolean; ?guilds: String[]; ?ownerOnly: Boolean;}} param1
     */
    constructor(client, {
        name,
        commandData,
        dirname = null,
        enabled = true,
        guilds = [client.setting.testGuild],  //test guild only by default
        ownerOnly = true,
    }) {
        this.name = name;
        this.client = client;
        this.config = { dirname, enabled, guilds, ownerOnly };
        this.commandData = commandData;
    }
}

module.exports = slashCommand;