const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client } = require('discord.js');
const fs = require('fs');
const yaml = require('js-yaml');
const setting = yaml.load(fs.readFileSync('./assets/yaml/setting.yaml'));

class slashCommand {
    constructor(client, {
        name,
        commandData,
        dirname = null,
        enabled = false,
        guilds = [setting.testGuild],
        ownerOnly = true,
    }) {
        this.name = name;
        this.client = client;
        this.config = { dirname, enabled, guilds, ownerOnly };
        this.commandData = commandData;
    }
}

module.exports = slashCommand;