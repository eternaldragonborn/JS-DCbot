const { Client, Collection } = require("discord.js");
const Table = require('cli-table');
const fs = require('fs');
const { loadYaml, writeYaml } = require("./yaml");

const colors = require('colors');
colors.setTheme({
    head: 'brightBlue',
    success: 'brightGreen',
    error: 'brightRed',
    warn: 'brightYellow',
});

class DragonBot extends Client {

    constructor(options) {
        super(options);

        this.setting = loadYaml('./assets/yaml/setting.yaml')['bot'];
        this.slashCommands = new Collection();

        this.folder = this.setting['folder'];
        this.Channel = this.setting['channel'];
    }

    syncSlashCommand() {
        Object.keys(this.registeredAppCmd).forEach(command => {
            if (!this.newRegisterAppCmd.includes(command)) {  //deleted global command
                this.application.commands.delete(this.registeredAppCmd[command]);
                delete this.registeredAppCmd[command];
            }
        });

        writeYaml('./assets/yaml/applicationCommands.yaml', this.registeredAppCmd);
    }

    async init() {
        this.testGuild = this.guilds.cache.get(this.setting.testGuild);
        this.registeredAppCmd = loadYaml('./assets/yaml/applicationCommands.yaml') ?? {};
        this.newRegisterAppCmd = [];

        const table = new Table({ head: ['Category'.head, 'File'.head, 'Status'.head, 'Reason/Error'.head] });

        table.push(...await this.loadAllSlash(), ...this.loadAllEvents());
        console.log(table.toString());
    }

    //#region slashCommands

    async loadAllSlash() {
        const path = this.folder['slashCommand']
        const commandFiles = fs.readdirSync(path).filter(file => file.endsWith('.js'));
        const results = []

        this.guilds.cache.forEach(guild => guild.commands.set([])); //reset guild command


        const load = async () => {
            for (const commandFile of commandFiles) {
                const result = ['slashCommand', commandFile];
                await this.loadSlash(path, commandFile)
                    .then((value) => {
                        results.push([...result, ...value])
                    })
                    .catch((err) => results.push([...result, 'ERROR'.error, err.message.error]));
            }
        }
        await load();
        this.syncSlashCommand();

        return (results);
    }

    async loadSlash(path, file) {
        return new Promise((resolve) => {

            const command = new (require(`${path}/${file}`))(this);
            if (!command.config.enabled) resolve(['WARN'.warn, 'not enabled'.warn]);  //command is not enabled

            this.slashCommands.set(command.name, command);

            //slash command register
            if (command.config.guilds.length === 0) {  //application command
                this.application.commands.create(command.commandData) //register and record
                    .then(command => {
                        this.registeredAppCmd[command.name] = command.id;
                        this.newRegisterAppCmd.push(command.name);
                        resolve(['SUCCESS'.success, 'global command'.warn]);
                    });
            }
            else {
                for (const guild of command.config.guilds)
                    this.guilds.cache.get(guild).commands.create(command.commandData)
                resolve(['SUCCESS'.success, '']);
            }
        })
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
            } catch (error) {
                result.push('ERROR'.error, error.message.error);
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