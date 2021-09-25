const { Client, Collection } = require("discord.js");
const Table = require('cli-table');
const fs = require('fs');
const { loadYaml } = require("../helpers/yaml");

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
        this.logger = new Logger();

        this.folder = this.setting['folder'];
        this.Channel = this.setting['channel'];
    }

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

    async init() {
        this.logger.log('Bot initializing.');

        this.testGuild = this.guilds.cache.get(this.setting.testGuild);
        this.newRegisterAppCmd = [];

        const table = new Table({ head: ['Category'.head, 'File'.head, 'Status'.head, 'Reason/Error'.head] });

        table.push(...await this.loadAllSlash(), ...this.loadAllEvents());
        console.log(table.toString());

        this.logger.log('End of initialzing.');
    }

    //#region slashCommands

    async loadAllSlash() {
        const path = this.folder['slashCommand'];
        const commandFiles = fs.readdirSync(path).filter(file => file.endsWith('.js'));
        const results = []

        this.logger.log('Loading slash commands files.');
        this.guilds.cache.forEach(guild => guild.commands.set([])); //reset guild command


        const load = async () => {
            for (const commandFile of commandFiles) {
                const result = ['slashCommand', commandFile];
                await this.loadSlash(path, commandFile)
                    .then((value) => {
                        results.push([...result, ...value]);
                        this.logger.log(`Slash command file ${commandFile} gas been loaded.`)
                    })
                    .catch((err) => {
                        results.push([...result, 'ERROR'.error, err.message.error])
                        this.logger.log(`Failed to load slash command "${commandFile}".`, 'ERROR');
                    });
            }
        }
        await load();
        this.syncApplicationCommand();

        return (results);
    }

    async loadSlash(path, file) {
        return new Promise((resolve) => {

            const command = new (require(`${path}/${file}`))(this);
            if (!command.config.enabled) {
                resolve(['WARN'.warn, 'not enabled'.warn]);
                this.logger.log(`Slash command "${command.name}" not enabled.`, 'WARN');
            }  //command is not enabled

            this.slashCommands.set(command.name, command);

            //slash command register
            if (command.config.guilds.length === 0) {  //application command
                this.application.commands.create(command.commandData) //register and record
                    .then(command => {
                        this.newRegisterAppCmd.push(command.name);
                        resolve(['SUCCESS'.success, 'global command'.warn]);

                        this.logger.log(`Application command "${command.name}" registered.`)
                    });
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
            try {
                this.loadEvent(file);
                result.push('SUCCESS'.success, '');
                this.logger.log(`Event file ${file} has benn loaded.`)
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