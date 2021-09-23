const { Client, Collection } = require("discord.js");
const Table = require('cli-table');
const fs = require('fs');
const yaml = require('js-yaml');

class DragonBot extends Client {

    constructor(options) {
        super(options);

        this.setting = yaml.load(fs.readFileSync('./assets/yaml/setting.yaml', 'utf8'));
        this.slashCommands = new Collection();

        this.commandFolder = `${process.cwd()}/commands`;
        this.eventFolder = `${process.cwd()}/events`;
    }

    init() {
        this.testGuild = this.guilds.cache.get(this.setting.testGuild);

        const table = new Table({ head: ['Category', 'File', 'Status', 'Reason/Error number'], colWidths: [15, 15, 7, 100] });

        [].concat(this.loadAllSlash(), this.loadAllEvents()).forEach(result => table.push(result));

        console.log(table.toString());
    }

    //#region slashCommands

    loadAllSlash() {
        const path = `${this.commandFolder}/slashCommands`
        const commandFiles = fs.readdirSync(path).filter(file => file.endsWith('.js'));
        const results = []

        commandFiles.forEach(commandFile => {
            const result = ['slashCommand', commandFile];
            try {
                if (this.loadSlash(path, commandFile))
                    result.push('✔️', '');
                else
                    result.push('❗', 'not enabled');
            } catch (error) {
                console.log(`<* ${commandFile} error>\n\t` + error);
                result.push('❌');
            } finally { results.push(result); }
        });
        return results;
    }

    loadSlash(path, file) {
        const command = new (require(`${path}/${file}`))(this);
        if (!command.config.enabled) return false;  //command is not enabled

        this.slashCommands.set(command.name, command);

        //slash command register
        if (command.config.guilds)
            command.config.guilds.forEach(guild => {
                this.guilds.cache.get(guild).commands.create(command.commandData)
            });
        else
            this.application.commands.create(command.commandData);
        return true;
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
                result.push('✔️', '');
            } catch (error) {
                result.push('❌', error);
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