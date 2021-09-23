const { Client, Interaction, MessageEmbed } = require("discord.js");

module.exports = (client) => {
    client.on('interactionCreate', (interaction) => {
        if (!interaction.isCommand()) return;
        else {
            const command = client.slashCommands.get(interaction.commandName);
            //#region command not exist
            if (!command) { //指令已不存在
                interaction.reply({ content: `command \`${interaction.commandName}\` is no longer exist.`, ephemeral: true })
                try { //刪除斜線指令
                    interaction.guild.commands.delete(interaction.commandId);
                    client.application.commands.delete(interaction.commandId)
                } finally { return };
            }
            //#endregion
            try {
                command.execute(client, interaction);
            } catch (error) {
                const embed = new MessageEmbed().setTitle('指令執行錯誤').setColor('RED')
                    .addField('原因：', error);
                interaction.reply({ embeds: [embed] });
            }
        }
    });
}