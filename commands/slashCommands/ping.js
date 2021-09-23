const { SlashCommandBuilder } = require('@discordjs/builders');
const slashCommand = require('../../base/slashCommand');
const name = 'ping';

const init = () => {
    command = new SlashCommandBuilder().setName(name).setDescription('Just a ping command.');
    return command.toJSON();
}

class ping extends slashCommand {
    constructor(client) {
        super(client, {
            name: name,
            commandData: init(),
            enabled: true,
            guilds: ['719132687897591808'],
            ownerOnly: true
        });
    }

    execute(client, interaction) {
        interaction.reply({ content: 'pong!', ephemeral: true });
    }
}

module.exports = ping;