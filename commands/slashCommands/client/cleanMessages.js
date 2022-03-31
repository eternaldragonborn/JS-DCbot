const { DMChannel, TextChannel } = require("discord.js");
const {
  SlashCommand,
  CommandOptionType,
  CommandContext,
} = require("slash-create");
const client = require("../../..");
const { manager } = require("../../../assets/const");

module.exports = class FileReload extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: "cls",
      description: "刪除bot訊息",
      // guildIDs: [guilds.test],
      options: [
        {
          type: CommandOptionType.INTEGER,
          name: "num",
          description: "刪除的最大數量",
        },
      ],
      deferEphemeral: true,
    });
    // this.enabled = false;
    this.filePath = __filename;
  }

  /**
   * @param {CommandContext} ctx
   */
  async run(ctx) {
    if (!ctx.guildID && !manager.includes(ctx.user.id)) {
      await ctx.send({ content: "你沒有權限執行該指令", ephemeral: true });
      return;
    }

    const max = ctx.options.num ?? 50;
    try {
      /**
       * @type { DMChannel | TextChannel }
       */
      const channel =
        client.channels.resolve(ctx.channelID) ??
        (await client.channels.fetch(ctx.channelID));
      const messages = channel.messages.fetch({ limit: 100 });

      let count = 0;
      const targetMessages = (await messages).filter((msg) => {
        if (msg.author?.id === client.application.id && count < max) {
          count++;
          return true;
        }
      });

      if (ctx.guildID) await channel.bulkDelete(targetMessages, true);
      else for (let msg of targetMessages.values()) await msg.delete();

      await ctx.send({
        content: `已刪除 \`${count}\` 則訊息`,
        ephemeral: true,
      });
    } catch (error) {
      await ctx.sendFollowUp("執行時發生未知錯誤", { ephemeral: true });
      client.logger.error(error.message);
    }
  }
};
