const { MessageEmbed } = require("discord.js");
const DragonBot = require('../base/dragonBot.js');

/**
 *
 * @param { DragonBot } client
 */
module.exports = (client) => {
    client.on('interactionCreate', (interaction) => {
        if (!interaction.isCommand()) return;
        else {
            const command = client.slashCommands.get(interaction.commandName);
            //#region command not exist
            if (!command) { //指令已不存在
                interaction.reply({ content: `command \`${interaction.commandName}\` is no longer exist.`, ephemeral: true })
                //刪除斜線指令
                try { interaction.guild.commands.delete(interaction.commandId); }
                catch { client.application.commands.delete(interaction.commandId) }
                finally { return };
            }
            //#endregion
            try {
                client.logger.log(`${interaction.member?.displayName ?? interaction.user.username} used command "${command.name}".`, 'CMD');
                command.execute(client, interaction)
                    .then(() => client.logger.log(`End of command "${command.name}" execution.`, 'CMD'));
            } catch (error) {  //疑似無作用
                client.logger.log(`There is an error when executing command "${command.name}".\n\t${error}`);
                const embed = new MessageEmbed().setTitle('指令執行錯誤').setColor('RED')
                    .addField('原因：', error);
                interaction.channel.send({ embeds: [embed] });
            } finally {

            }
        }
    });

}