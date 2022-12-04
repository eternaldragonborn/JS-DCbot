const { DMChannel, TextChannel, Collection, Message } = require("discord.js");
const {
  SlashCommand,
  CommandOptionType,
  ComponentType,
  ButtonStyle,
} = require("slash-create");
const client = require("../../..");
const { manager } = require("../../../constants/const");

module.exports = class FileReload extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: "cls",
      description: "刪除bot或指定目標所發的訊息",
      // guildIDs: [guilds.test],
      options: [
        {
          type: CommandOptionType.INTEGER,
          name: "num",
          description: "刪除的最大數量，預設50",
        },
        {
          type: CommandOptionType.USER,
          name: "target",
          description: "要刪除的目標，於私訊頻道無效",
        },
        {
          type: CommandOptionType.STRING,
          name: "id",
          description: "要刪除的對象ID，於私訊頻道無效",
        },
      ],
      deferEphemeral: true,
    });
    // this.enabled = false;
    this.filePath = __filename;
  }

  /**
   * @param { import("slash-create").CommandContext } ctx
   */
  async run(ctx) {
    if (!ctx.guildID && !manager.includes(ctx.user.id)) {
      await ctx.send({ content: "你沒有權限執行該指令", ephemeral: true });
      return;
    }
    await ctx.defer(this.deferEphemeral);
    const targetUser =
      ctx.guildID && manager.includes(ctx.user.id)
        ? ctx.options.id ?? ctx.options.target ?? client.user.id
        : client.user.id;

    const max = ctx.options.num ?? 50;
    try {
      /**
       * @type { DMChannel | TextChannel }
       */
      const channel =
        client.channels.resolve(ctx.channelID) ??
        (await client.channels.fetch(ctx.channelID));
      /**
       * @type { Collection<string, Message> }
       */
      let targetMessages = new Collection();
      let count = 0;

      while (count < max) {
        let messages;
        try {
          messages = await channel.messages.fetch({ limit: 100 });
          targetMessages = targetMessages.concat(
            messages.filter((msg) => {
              if (msg.author?.id === targetUser && count < max) {
                count++;
                return true;
              }
            }),
          );
        } catch (err) {
          client.logger.warn("fetch message error, " + err.message);
          break;
        }
      }

      if (count === 0) {
        await ctx.send("無任何訊息可刪除", { ephemeral: true });
        return;
      }
      const reply = await ctx.send(
        `即將刪除 \`${targetMessages.size}\` 則訊息，該動作無法復原，請確認`,
        {
          ephemeral: this.deferEphemeral,
          components: [
            {
              type: ComponentType.ACTION_ROW,
              components: [
                {
                  type: ComponentType.BUTTON,
                  custom_id: "cls_confirm",
                  label: "確認",
                  style: ButtonStyle.DESTRUCTIVE,
                },
                {
                  type: ComponentType.BUTTON,
                  custom_id: "cls_cancel",
                  label: "取消",
                  style: ButtonStyle.PRIMARY,
                },
              ],
            },
          ],
        },
      );

      const timeout = setTimeout(async () => {
        await reply.edit("超出時間，請重新使用指令", { components: [] });
      }, 7_000);

      ctx.registerComponent(
        "cls_confirm",
        async (componentCtx) => {
          if (componentCtx.user.id !== ctx.user.id) return;

          clearTimeout(timeout);
          if (ctx.guildID)
            count = (await channel.bulkDelete(targetMessages, true)).size;
          else {
            count = 0;
            for (let msg of targetMessages.values()) {
              try {
                await msg.delete();
                count++;
              } catch (err) {
                break;
              }
            }
          }

          await reply.edit(`已刪除 \`${count}\` 則訊息`, { components: [] });
        },
        7000,
        async () => {
          if (ctx.expired) return;
          ctx.unregisterComponent("cls_confirm");
          await reply.edit("超出時間，請重新使用指令", { components: [] });
        },
      );

      ctx.registerComponent(
        "cls_cancel",
        async (componentCtx) => {
          if (componentCtx.user.id !== ctx.user.id) return;

          clearTimeout(timeout);
          await reply.edit("動作取消", { components: [] });
        },
        7_000,
        async () => {
          if (ctx.expired) return;
          ctx.unregisterComponent("cls_cancel");
          await reply.edit("超出時間，請重新使用指令", { components: [] });
        },
      );
    } catch (error) {
      await ctx.send("執行時發生未知錯誤", { ephemeral: true });
      client.logger.error(error.message);
    }
  }
};
