//const { SlashCommandBuilder } = require('@discordjs/builders');
//const slashCommand = require('../../../base/slashCommand');
const { SlashCommand, CommandOptionType } = require('slash-create');
const { CommandInteraction } = require('discord.js');
const DragonBot = require('../../../base/dragonBot');

/* const init = () => {
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
} */

module.exports = class FileReload extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'reload',
            description: '重載檔案',
            guildIDs: ['719132687897591808'],
            options: [{
                type: CommandOptionType.STRING,
                name: 'category',
                description: '要重載的類別',
                required: true,
                choices: [
                    { name: '斜線指令', value: 'slash' },
                    { name: 'events', value: 'event' },
                    //{ name: '一般指令', value: 'command' }
                ]
            }]
        })
        this.filePath = __filename;
    }

    /**
     *
     * @param { DragonBot } client
     * @param { CommandInteraction} interaction
    */
    async run(ctx) {

        /* switch (ctx.options.category) {
            case 'prefixCommand':
                break;
            case 'slashCommand': {
                await client.unload(category);
                await client.loadAllSlash();
                break;
            }
            case 'event': {
                client.unload(category)
                    .then(() => client.loadAllEvents());
                break;
            }
            default:
                TypeError(`category ${category} not exist.`);
        } */
        ctx.reply({ content: `${category} has been reloaded.`, ephemeral: true });
    }
}