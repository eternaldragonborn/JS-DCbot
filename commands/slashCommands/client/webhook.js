const { SlashCommand, CommandOptionType } = require("slash-create");
const { guilds } = require("../../../assets/const");
const client = require("../../../index");

module.exports = class Webhooks extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: "webhook",
      guildIDs: [guilds.test],
      description: "webhooks",
      options: [
        {
          type: CommandOptionType.SUB_COMMAND,
          description: "取得或新增",
          name: "get",
          options: [
            {
              type: CommandOptionType.STRING,
              required: true,
              name: "channel",
              description: "頻道",
            },
            {
              name: "name",
              description: "webhook名稱",
              required: false,
              type: CommandOptionType.STRING,
            },
          ],
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          description: "刪除",
          name: "delete",
          options: [
            {
              type: CommandOptionType.STRING,
              required: true,
              name: "channel",
              description: "頻道",
            },
          ],
        },
        {
          name: "edit",
          description: "編輯webhook",
          type: CommandOptionType.SUB_COMMAND,
          options: [
            {
              name: "channel",
              description: "頻道",
              type: CommandOptionType.STRING,
              required: true,
            },
            {
              name: "name",
              type: CommandOptionType.STRING,
              description: "名稱",
            },
            {
              name: "avatar",
              description: "頭像URL",
              type: CommandOptionType.STRING,
            },
          ],
        },
      ],
    });
    this.filePath = __filename;
  }

  async run(ctx) {
    const subcommand = ctx.subcommands[0];
    let { channel, ...options } = ctx.options[subcommand];
    try {
      channel = await client.channels.fetch(channel);
    } catch (err) {
      await ctx.send({ content: "無效的頻道ID", ephemeral: true });
      return;
    }
    const hook = (await channel.fetchWebhooks()).find((v) => {
      return v.owner?.id === process.env.APP_ID;
    });
    switch (subcommand) {
      case "get":
        if (hook) {
          await ctx.send({ content: hook.id, ephemeral: true });
        } else {
          channel
            .createWebhook(options.name ?? "Dragon's webhook")
            .then((webhook) =>
              ctx.send({
                content: `created\n${channel.name} : ${webhook.id}`,
                ephemeral: true,
              }),
            )
            .catch((err) =>
              ctx.send({ content: `failed, ${err.message}`, ephemeral: true }),
            );
        }
        break;
      case "delete":
        if (!hook)
          await ctx.send({ content: "該頻道無Webhook", ephemeral: true });
        else {
          hook
            .delete()
            .then(() => ctx.send({ content: "已刪除", ephemeral: true }))
            .catch((err) => {
              ctx.send({ content: "失敗，" + err.message, ephemeral: true });
            });
        }
        break;
      case "edit":
        if (!hook)
          await ctx.send({ content: "該頻道無Webhook", ephemeral: true });
        else {
          hook
            .edit(options)
            .then(() => ctx.send({ content: "success", ephemeral: true }))
            .catch((err) =>
              ctx.send({ content: "失敗，" + err.message, ephemeral: true }),
            );
        }
        break;
    }
  }
};
