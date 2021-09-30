const { MessageEmbed } = require("discord.js");

module.exports = (client) => {
    client.creator.removeAllListeners();

    client.creator.on('commandRegister', (command, creator) => {
        command.guildIDs?.length > 0 ?
            client.logger.log(`Command \`${command.commandName}\` registered.`, 'READY') :
            client.logger.log(`Global command \`${command.commandName}\` registered.`, 'WARN');
    });

    client.creator.on('commandReregister', (command, oldCommand) => {
        command.guildIDs?.length > 0 ?
            client.logger.log(`Command \`${command.commandName}\` registered.`, 'READY') :
            client.logger.log(`Global command \`${command.commandName}\` registered.`, 'WARN');
    });

    client.creator.on('commandUnregister', (command) => {
        client.logger.log(`Command \`${command.commandName}\` unregistered.`, 'WARN');
    });

    client.creator.on('synced', () => {
        client.logger.log('Commands synced!', 'READY');
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
        client.logger.log(`Executing command \`${command.commandName}\`.`, 'CMD');
        result.then(() => client.logger.log(`Command \`${command.commandName}\` executed.`, 'CMD'));
    })

    client.creator.on('error', (err) => {
        client.logger.log(`Creator error.\n\t${err}`, 'ERROR');
    })
}