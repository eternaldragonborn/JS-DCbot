const { MessageEmbed } = require('discord.js');
const { SlashCommand, CommandOptionType } = require('slash-create');
const DragonBot = require('../../../base/dragonBot');

module.exports = class FileReload extends SlashCommand {
    /**
     *
     * @param { DragonBot } client
     * @param {*} creator
     */
    constructor(client, creator) {
        super(creator, {
            name: 'reload',
            description: '重載檔案',
            //guildIDs: ['719132687897591808'],
            options: [{
                type: CommandOptionType.STRING,
                name: 'type',
                description: '要重載的類別',
                required: true,
                choices: [
                    { name: '斜線指令', value: 'slashCommand' },
                    { name: 'events', value: 'event' },
                    //{ name: '一般指令', value: 'command' }
                ]
            },
            {
                type: CommandOptionType.STRING,
                name: 'category',
                description: '要重載的分類',
                required: false,
                choices: [
                    { name: 'clinet', value: 'client' },
                    { name: '訂閱系統', value: 'subscribeSystem' },
                ]
            }],
            //defaultPermission: false,
            deferEphemeral: true,
        })
        this.client = client;
        this.filePath = __filename;
    }

    async run(ctx) {
        if (ctx.user.id === this.client.owner)
            this.client.unload(ctx.options.category ?? ctx.options.type)
                .then(() => {
                    const embed = new MessageEmbed()
                        .setTitle(`${ctx.options.category ?? ctx.options.type} reloaded.`)
                        .setColor('BLUE');
                    switch (ctx.options.type) {
                        case 'prefix':
                            break;
                        case 'slashCommand': {
                            this.client.loadSlash(ctx.options.category).forEach(result => {
                                embed.addField(result[0], result[1]);
                            });
                            break;
                        }
                        case 'event': {
                            this.client.loadAllEvents();
                            break;
                        }
                        default:
                            TypeError(`Category ${ctx.options.category} not exist.`);
                    }
                    ctx.send({ embeds: [embed], ephemeral: true });
                })
        else ctx.send({ content: '你沒有權限執行此指令' });
    }
}