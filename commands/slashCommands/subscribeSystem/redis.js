const { SlashCommand, CommandOptionType } = require('slash-create');
const { manager, guilds } = require('../../../assets/const');
const { redis } = require('../../../helpers/database');
const fs = require('fs');

module.exports = class Redis extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'redis',
            description: 'test redis',
            guildIDs: guilds.test,
            options: [
                {
                    name: 'set',
                    description: 'set k/v',
                    type: CommandOptionType.SUB_COMMAND,
                    options: [
                        {
                            name: 'key',
                            description: 'key',
                            type: CommandOptionType.STRING,
                            required: true
                        },
                        {
                            name: 'value',
                            description: 'value',
                            type: CommandOptionType.STRING,
                            required: true
                        },
                        {
                            name: 'expire',
                            description: 'time to expire',
                            type: CommandOptionType.INTEGER,
                            required: false
                        }
                    ]
                },
                {
                    name: 'delete',
                    description: 'delete key',
                    type: CommandOptionType.SUB_COMMAND,
                    options: [{
                        name: 'key',
                        description: 'key',
                        type: CommandOptionType.STRING,
                        required: true
                    }]
                },
                {
                    name: 'get',
                    description: 'get value of key',
                    type: CommandOptionType.SUB_COMMAND,
                    options: [{
                        name: 'key',
                        description: 'key',
                        type: CommandOptionType.STRING,
                        required: true
                    }]
                },
                {
                    name: 'getkeys',
                    description: 'getkeys',
                    type: CommandOptionType.SUB_COMMAND
                }
            ]
        });
        this.enabled = true;
        this.filePath = __filename;
    }

    async run(ctx) {
        const subcommand = ctx.subcommands[0];
        const args = ctx.options[subcommand];
        switch (subcommand) {
            case 'set':
                args.expire ?
                    redis.set(args.key, args.value, { EX: args.expire })
                        .then(res => {
                            console.log(res);
                            ctx.send({ content: 'success' });
                        })
                        .catch(err => ctx.send({ content: err.message })) :
                    redis.set(args.key, args.value)
                        .then(res => {
                            console.log(res);
                            ctx.send({ content: 'success' });
                        })
                        .catch(err => ctx.send({ content: err.message }));
                break;
            case 'get':
                redis.get(args.key)
                    .then((res) => {
                        if (!res)
                            ctx.send({ content: 'NULL' });
                        else if (res.length > 2000) {
                            fs.writeFileSync('data.json', JSON.stringify(JSON.parse(res)));
                            // console.log(res);
                            ctx.send({ content: '..', files: ['data.json'] });
                            // fs.unlinkSync('./data.json');
                        } else {
                            ctx.send({ content: res })
                        }
                    })
                    .catch(err => ctx.send({ content: err.message }));
                break;
            case 'delete':
                redis.del(args.key)
                    .then((res) => ctx.send({ content: res }))
                    .catch(err => ctx.send({ content: err.message }));
                break;
            case 'getkeys':
                redis.keys('*')
                    .then((res) => ctx.send({ content: res.join('\n') }))
                    .catch(err => ctx.send({ content: err.message }));
                break;
        }
    }
}