const { SlashCommandBuilder } = require('@discordjs/builders');
const slashCommand = require('../../base/slashCommand');
const { CommandInteraction } = require('discord.js');
const DragonBot = require('../../base/dragonBot');

const name = 'reload';

const init = () => {
    const command = new SlashCommandBuilder()
        .setName(name)
        .setDescription('unload and then load the whole category')
    command.addStringOption((option) =>
        option.setName('category')
            .setDescription('要重新載入的類別')
            .addChoice('斜線指令', 'slashCommand')
            .addChoice('events', 'event')
            //.addChoice('一般指令', 'prefixCommand')
            .setRequired(true),
    );
    command.defaultPermission = false;

    return command.toJSON();
}

class load extends slashCommand {
    constructor(client) {
        super(client, {
            name: name,
            commandData: init(),
            //guilds: [],
            enabled: true,
            ownerOnly: true
        })
    }

    /**
     *
     * @param { DragonBot } client
     * @param { CommandInteraction} interaction
    */
    async execute(client, interaction) {
        const category = interaction.options.getString('category');

        /* const unload = (category) => {
            const path = client.folder[category];
            const files = glob.sync(`${path}/*.js`);
            files.forEach(file => {
                delete require.cache[require.resolve(file)];
                if (category === 'slashCommand') {
                    const commandName = file.split('/').pop().slice(0, -3);
                    client.slashCommands.delete(commandName);
                }
            })
        } */

        switch (category) {
            case 'prefixCommand':
                break;
            case 'slashCommand': {
                client.unload(category)
                    .then(() => client.loadAllSlash());
                break;
            }
            case 'event': {
                client.unload(category)
                    .then(() => client.loadAllEvents());
                break;
            }
            default:
                TypeError(`category ${category} not exist.`);
        }
        interaction.reply({ content: `${category} has been reloaded.`, ephemeral: true });
    }
}

module.exports = load;