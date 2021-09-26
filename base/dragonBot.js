const { Client, Collection } = require("discord.js");
const Table = require('cli-table');
const fs = require('fs');
const { loadYaml } = require("../helpers/yaml");
const glob = require('glob');

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
        this.slashCommands = new Collection();

        this.folder = this.setting['folder'];
        this.Channel = this.setting['channel'];
    }

    async init() {
        if (false)
            await this.channels.fetch(this.Channel['startingLog']) //send last log to server
                .then(channel => channel.send({ files: ['JSbot.log'] }))
        this.logger = new Logger();
        this.logger.log('Bot initializing.');


        this.testGuild = this.guilds.cache.get(this.setting.testGuild);

        const table = new Table({ head: ['Category'.head, 'File'.head, 'Status'.head, 'Reason/Error'.head] });

        table.push(...await this.loadAllSlash(), ...this.loadAllEvents());
        console.log(table.toString());

        this.logger.log('End of initialzing.', 'INFO');
    }

    async unload(category) {
        const path = this.folder[category];
        const files = glob.sync(`${path}/*.js`);
        files.forEach(file => {
            delete require.cache[require.resolve(file)];
            if (category === 'slashCommand') {
                const commandName = file.split('/').pop().slice(0, -3);
                this.slashCommands.delete(commandName);
            }
        })
    }

    //#region slashCommands
    syncApplicationCommand() {
        this.application.commands.fetch().then(commands => {
            commands.each(command => {
                if (!this.newRegisterAppCmd.includes(command.name)) {
                    this.application.commands.delete(command);

                    this.logger.log(`Application command "${command.name}" removed.`);
                }
            });
        });
    }

    async loadAllSlash() {
        const path = this.folder['slashCommand'];
        const commandFiles = fs.readdirSync(path).filter(file => file.endsWith('.js'));
        const results = []

        this.logger.log('Loading slash commands files.', 'INFO');

        this.newRegisterAppCmd = [];
        this.guilds.cache.forEach(guild => guild.commands.set([])); //reset guild command


        const load = async () => {
            for (const commandFile of commandFiles) {
                const result = ['slashCommand', commandFile];
                await this.loadSlash(path, commandFile)
                    .then((value) => {
                        results.push([...result, ...value]);
                    })
                    .catch((err) => {
                        results.push([...result, 'ERROR'.error, err.message.error])
                        this.logger.log(`Failed to load slash command "${commandFile}".\n\t${err}`, 'ERROR');
                    });
            }
        }
        await load();
        this.syncApplicationCommand();

        return (results);
    }

    async loadSlash(path, file) {
        return new Promise((resolve) => {
            this.logger.log(`Loading file ${file}.`, 'INFO')

            const command = new (require(`${path}/${file}`))(this);
            if (!command.config.enabled) {  //command is not enabled
                resolve(['WARN'.warn, 'not enabled'.warn]);
                this.logger.log(`Slash command "${command.name}" not enabled.`, 'WARN');
            }

            this.slashCommands.set(command.name, command);

            //slash command register
            if (command.config.guilds.length === 0) {  //application command
                if (!this.application.commands.resolve(command.commandData)) {  //not registered yet
                    this.newRegisterAppCmd.push(command.name);

                    this.logger.log(`Application command "${command.name}" registered.`)
                    resolve(['SUCCESS'.success, 'global command'.warn]);
                }
                else {
                    resolve(['SUCCESS'.success, '']);
                }
                /* this.application.commands.create(command.commandData) //register and record
                    .then(command => {
                        this.newRegisterAppCmd.push(command.name);
                        resolve(['SUCCESS'.success, 'global command'.warn]);

                        this.logger.log(`Application command "${command.name}" registered.`)
                    }); */
            }
            else {
                for (const guild of command.config.guilds)
                    this.guilds.cache.get(guild).commands.create(command.commandData);
                resolve(['SUCCESS'.success, '']);
            }
        })
    }

    //#endregion

    //#region events

    loadAllEvents() {
        const eventFiles = fs.readdirSync(this.folder['event']).filter(file => file.endsWith('.js'));
        const results = [];

        this.logger.log('Loading events files.')

        eventFiles.forEach(file => {
            const result = ['event', file];
            this.logger.log(`Loading file ${file}.`, 'INFO');
            try {
                this.loadEvent(file);
                result.push('SUCCESS'.success, '');
            } catch (error) {
                result.push('ERROR'.error, error.message.error);

                this.logger.log(`Failed to load event ${file}\n ${error}`, 'ERROR');
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