class slashCommand {
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