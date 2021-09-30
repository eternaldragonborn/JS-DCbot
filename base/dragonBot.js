const { Client } = require("discord.js");
const Table = require('cli-table');
const fs = require('fs');
const { loadYaml } = require("../helpers/yaml");
const glob = require('glob');
const { SlashCreator, GatewayServer } = require('slash-create');

const colors = require('colors');
const { Logger } = require("../helpers/logger");
colors.setTheme({
    head: 'brightBlue',
    success: 'brightGreen',
    error: 'brightRed',
    warn: 'brightYellow',
});

class DragonBot extends Client {

    constructor(options) {
        super(options);

        this.setting = loadYaml('setting')['bot'];
        this.folder = this.setting['folder'];
        this.Guild = this.setting['guild'];
        this.Channel = this.setting['channel'];
        this.owner = this.setting['ownerId'];
        this.manager = this.setting['manager'];

        this.creator = new SlashCreator(this.setting['creatorSetting'])
            .withServer(
                new GatewayServer(
                    (handler) => this.ws.on('INTERACTION_CREATE', handler)
                )
            );
        this.logger = new Logger();
        this.pg = new (require('../helpers/database'))(this).client;
    }

    async init() {
        if (false)
            await this.channels.fetch(this.Channel['startingLog']) //send last log to server
                .then(channel => channel.send({ files: ['JSbot_last.log'] }))

        this.logger.log('Bot initializing.');

        const table = new Table({ head: ['Category'.head, 'File'.head, 'Status'.head, 'Reason/Error'.head] });

        this.loadAllEvents();
        this.loadSlash();

        /* table.push(...await this.loadAllSlash(), ...this.loadAllEvents());
        console.log(table.toString()); */

        this.logger.log('End of initialzing.', 'READY');
    }

    async unload(category) {
        var path = '';
        (category === 'slashCommand' || category === 'event' || category === 'prefix') ?
            path = this.folder[category] :
            path = `${this.folder['slashCommand']}/${category}`;
        glob.sync(`${path}/*.js`).forEach(file => {
            delete require.cache[require.resolve(file)];
        })
    }

    //#region slashCommands

    loadSlash(category = null) {
        const results = [];
        glob.sync(`${this.folder['slashCommand']}/${category ?? '*'}/*.js`).forEach(file => {
            const fileName = file.split('/').pop();
            try {
                const command = this.creator.commands.find(cmd => cmd.filePath.includes(fileName));
                const newCommand = new (require(file))(this, this.creator);
                if (newCommand.enabled ?? true) {
                    command ?  // if the command is registered
                        this.creator.reregisterCommand(newCommand, command) :
                        this.creator.registerCommand(newCommand);
                    newCommand.guildIDs?.length > 0 ?
                        results.push([newCommand.commandName, '✅']) :
                        results.push([newCommand.commandName, '⚠️\nGLOBAL']);
                } else {
                    results.push([newCommand.commandName, '⚠️\nNOT ENABLED!']);
                    this.logger.log(`Command \`${newCommand.commandName}\` not enabled.`, 'WARN');
                }
            }
            catch (error) {
                results.push([fileName, `❌\n${String(error)}`]);
                this.logger.log(`Failed to load file ${fileName}.\n\t${error}`, 'ERROR');
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

        this.logger.log('Loading "events" files.');

        eventFiles.forEach(file => {
            const result = ['event', file];
            this.logger.log(`Loading file ${file}.`, 'INFO');
            try {
                this.loadEvent(file);
                result.push('SUCCESS'.success, '');
            } catch (error) {
                result.push('ERROR'.error, error.message.error);

                this.logger.log(`Failed to load event ${file}\n\t${error}`, 'ERROR');
            } finally { results.push(result); }
        });
        return results;
    }

    loadEvent(file) {
        require(`${this.folder['event']}/${file}`)(this);
    }

    //#endregion
}
module.exports = DragonBot;