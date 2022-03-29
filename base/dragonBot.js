const { Client } = require("discord.js");
const fs = require('fs');
const { loadYaml } = require("../helpers/utils");
const glob = require('glob');
const { SlashCreator, GatewayServer } = require('slash-create');
const { redis, getRandomCode } = require('../helpers/database');
const log4js = require('log4js');

log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        app: { type: 'file', filename: '.log' }
    },
    categories: {
        default: { appenders: ['out', 'app'], level: "all" }
    }
});

class DragonBot extends Client {

    constructor(options) {
        super(options);

        this.setting = loadYaml('setting')['bot'];
        this.folder = this.setting['folder'];
        this.logger = log4js.getLogger('default');

        this.creator = new SlashCreator(this.setting['creatorSetting'])
            .withServer(
                new GatewayServer(
                    (handler) => this.ws.on('INTERACTION_CREATE', handler)
                )
            );
    }

    async init() {
        /**
         * @typedef {Object} Book
         * @property {string} url - 本本連結
         * @property {Set<string>} users - 取得過連結之使用者
         */
        /**
         * @type {{ [msgId: string]: Book }}
         */
        this.books = JSON.parse(await redis.get('book')) ?? {};
        Object.keys(this.books).forEach(msgId => { this.books[msgId] = new Set(this.books[msgId]); });

        this.loadAllEvents();
        this.loadSlash();
        // await this.login(process.env.DISCORD_TOKEN);

        /* table.push(...await this.loadAllSlash(), ...this.loadAllEvents());
        console.log(table.toString()); */

        redis.set('bot-token', getRandomCode(14));
    }

    async unload(category) {
        var path = '';
        (category === 'slashCommand' || category === 'event' || category === 'prefix') ?
            path = this.folder[category] :
            path = `${this.folder['slashCommand']}/${category}`;
        glob.sync(`${path}/*.js`).forEach(file => {
            delete require.cache[require.resolve(file)];
        });
    }

    //#region slashCommands

    loadSlash(category = null) {
        const results = [];
        glob.sync(`${this.folder['slashCommand']}/${category ?? '*'}/*.js`).forEach(file => {
            const fileName = file.split('/').pop();
            try {
                const command = this.creator.commands.find(cmd => cmd.filePath.includes(fileName));
                const newCommand = new (require(file))(this.creator);
                if (newCommand.enabled ?? true) {
                    //考慮改為command.reload()及registerIn()
                    command ?  // if the command is registered
                        //this.creator.reregisterCommand(newCommand, command) :
                        command.reload() :
                        this.creator.registerCommand(newCommand);
                    newCommand.guildIDs?.length > 0 ?
                        results.push([newCommand.commandName, '✅']) :
                        results.push([newCommand.commandName, '⚠️\nGLOBAL']);
                } else {
                    this.logger.trace(`⚠️Slash-command ${fileName} not enabled`)
                    results.push([newCommand.commandName, '⚠️\nNOT ENABLED!']);
                }
            }
            catch (error) {
                this.logger.error(`Failed to load slash-command ${fileName}( ${error} )`);
                results.push([fileName, `❌\n${String(error)}`]);
            }
        });
        this.creator.syncCommands({ syncGuilds: true, deleteCommands: true });
        return results;
    }

    //#endregion

    //#region events

    loadAllEvents() {
        const eventFiles = fs.readdirSync(this.folder['event']).filter(file => file.endsWith('.js'));
        const results = [];

        eventFiles.forEach(file => {
            const result = ['event', file];
            try {
                this.loadEvent(file);
                result.push('SUCCESS'.success, '');
                this.logger.info(`Event ${file} load success`);
            } catch (error) {
                result.push('ERROR'.error, error.message.error);
                this.logger.error(`Event ${file} load failed, ${error.message}`)
            } finally { results.push(result); }
        });
        return results;
    }

    loadEvent(file) {
        require(`${this.folder['event']}/${file}`)(this);
    }

    //#endregion
}
module.exports = {
    DragonBot,
};