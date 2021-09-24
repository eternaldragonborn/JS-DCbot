const { Client, Collection } = require("discord.js");
const Table = require('cli-table');
const fs = require('fs');
const yaml = require('js-yaml');

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

        this.setting = yaml.load(fs.readFileSync('./assets/yaml/setting.yaml', 'utf8'));
        this.slashCommands = new Collection();

        this.commandFolder = `${process.cwd()}/commands`;
        this.eventFolder = `${process.cwd()}/events`;
    }

    async init() {
        this.testGuild = this.guilds.cache.get(this.setting.testGuild);
        this.registeredAppCmd = yaml.load(fs.readFileSync('./assets/yaml/applicationCommands.yaml', 'utf8')) ?? {};
        this.newRegisterAppCmd = [];

        const table = new Table({ head: ['Category'.head, 'File'.head, 'Status'.head, 'Reason/Error'.head] });

        this.loadAllSlash()
            .then(value => table.push(...value, ...this.loadAllEvents()))
            .then(() => {
                console.log(table.toString());

                Object.keys(this.registeredAppCmd).forEach(command => {
                    if (!this.newRegisterAppCmd.includes(command)) {  //deleted global command
                        this.application.commands.delete(this.registeredAppCmd[command]);
                        delete this.registeredAppCmd[command];
                    }
                });

                const commandData = yaml.dump(this.registeredAppCmd);
                //console.log(commandData);
                fs.writeFileSync('./assets/yaml/applicationCommands.yaml', commandData);
            });
    }

    //#region slashCommands

    async loadAllSlash() {
        const path = `${this.commandFolder}/slashCommands`
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
        const eventFiles = fs.readdirSync(this.eventFolder).filter(file => file.endsWith('.js'));
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
        require(`${this.eventFolder}/${file}`)(this);
    }

    //#endregion
}
module.exports = DragonBot;