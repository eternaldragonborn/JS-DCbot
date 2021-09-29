const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class FileReload extends SlashCommand {
    constructor(client, creator) {
        super(creator, {
            name: 'reload',
            description: '重載檔案',
            guildIDs: ['719132687897591808'],
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
            }]
        })
        //this.enabled = false;
        this.client = client;
        this.filePath = __filename;
    }

    async run(ctx) {
        this.client.unload(ctx.options.category ?? ctx.options.type)
            .then(() => {
                switch (ctx.options.type) {
                    case 'prefix':
                        break;
                    case 'slashCommand': {
                        this.client.loadSlash(ctx.options.category);
                        break;
                    }
                    case 'event': {
                        this.client.loadAllEvents();
                        break;
                    }
                    default:
                        TypeError(`category ${ctx.options.category} not exist.`);
                }
                ctx.send({ content: `${ctx.options.category} has been reloaded.`, ephemeral: true });
            })

    }
}