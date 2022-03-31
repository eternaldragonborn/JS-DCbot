const { MessageEmbed } = require("discord.js");
const { DragonBot } = require("../base/dragonBot");

/**
 *
 * @param { DragonBot } client
 */
module.exports = (client) => {
  client.creator.removeAllListeners();

  client.creator
    .on("commandRegister", (command, creator) => {
      command.guildIDs?.length > 0
        ? client.logger.trace(`Command \`${command.commandName}\` registered.`)
        : client.logger.warn(
            `Global command \`${command.commandName}\` registered.`,
          );
    })
    .on("commandReregister", (command, oldCommand) => {
      command.guildIDs?.length > 0
        ? client.logger.trace(`Command \`${command.commandName}\` registered.`)
        : client.logger.warn(
            `Global command \`${command.commandName}\` registered.`,
          );
    })
    .on("commandUnregister", (command) => {
      client.logger.warn(`Command \`${command.commandName}\` unregistered.`);
    })
    .on("synced", () => {
      client.logger.info("Commands synced!");
    })
    .on("commandError", (command, err, ctx) => {
      client.logger.error(
        `Command \`${command.commandName}\` execution error: ${err}`,
      );
      const embed = new MessageEmbed()
        .setTitle("指令執行錯誤")
        .addField(command.commandName, err);
      if (ctx.initiallyResponded) {
        ctx
          .send({ embeds: [embed] })
          .then((msg) => {
            setTimeout(() => msg.delete(), 7000);
          })
          .catch();
      } else {
        ctx.send({ embeds: [embed] });
        setTimeout(() => ctx.delete(), 7000);
      }
    })
    .on("commandRun", (command, result, ctx) => {
      client.logger.trace(`Executing command \`${command.commandName}\`.`);
      result.then(() =>
        client.logger.trace(`Command \`${command.commandName}\` executed.`),
      );
    })
    .on("error", (err) => {
      client.logger.error(`Creator error: ${err}`);
    });
};
