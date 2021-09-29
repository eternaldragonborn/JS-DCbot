const { MessageEmbed } = require("discord.js");

module.exports = (client) => {
    client.creator.on('commandRegister', (command, creator) => {
        client.logger.log(`Command \`${command.commandName}\` registered.`, 'READY');
    });

    client.creator.on('commandReregister', (command, oldCommand) => {
        client.logger.log(`Command \`${oldCommand.commandName}\` re-registered`, 'READY');
    });

    client.creator.on('commandUnregister', (command) => {
        client.logger.log(`Command \`${command.commandName}\` unregistered.`, 'WARN');
    });

    client.creator.on('commandError', (command, err, ctx) => {
        client.logger.log(`Command \`${command.commandName}\` execution error.\n\t${err}`, 'ERROR');
        const embed = new MessageEmbed()
            .setTitle('指令執行錯誤')
            .addField(command.commandName, err);
        if (ctx.initiallyResponded) {
            ctx.send({ embeds: [embed] }).then(msg => {
                setTimeout(() => msg.delete(), 7000);
            }).catch();
        }
        else {
            ctx.send({ embeds: [embed] });
            setTimeout(() => ctx.delete(), 7000);
        }
    })

    client.creator.on('commandRun', (command, result, ctx) => {
        client.logger.log(`Executing command \`${command.commandName}\`.`);
        result.then(() => client.logger.log(`Command \`${command.commandName}\` executed.`, 'READY'));
    })

    client.creator.on('error', (err) => {
        client.logger.log(`Creator error.\n\t${err}`);
    })
}