const { MessageEmbed } = require("discord.js");
const {
  SlashCommand,
  CommandOptionType,
  ApplicationCommandPermissionType,
} = require("slash-create");
const client = require("../../../index");
const { owner, guilds } = require("../../../assets/const");

module.exports = class FileReload extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: "reload",
      description: "重載檔案",
      guildIDs: guilds.main,
      options: [
        {
          type: CommandOptionType.STRING,
          name: "type",
          description: "要重載的類別",
          required: true,
          choices: [
            { name: "斜線指令", value: "slashCommand" },
            { name: "events", value: "event" },
            //{ name: '一般指令', value: 'command' }
          ],
        },
        {
          type: CommandOptionType.STRING,
          name: "category",
          description: "要重載的分類",
          required: false,
          choices: [
            { name: "clinet", value: "client" },
            { name: "訂閱系統", value: "subscribeSystem" },
          ],
        },
      ],
      defaultPermission: false,
      deferEphemeral: true,
      permissions: {
        "669934356172636199": [
          {
            type: ApplicationCommandPermissionType.USER,
            id: "384233645621248011",
            permission: true,
          },
        ],
        "719132687897591808": [
          {
            type: ApplicationCommandPermissionType.USER,
            id: "384233645621248011",
            permission: true,
          },
        ],
      },
    });
    this.filePath = __filename;
  }

  async run(ctx) {
    if (ctx.user.id === owner)
      client.unload(ctx.options.category ?? ctx.options.type).then(() => {
        const embed = new MessageEmbed()
          .setTitle(`${ctx.options.category ?? ctx.options.type} reloaded.`)
          .setColor("BLUE");
        switch (ctx.options.type) {
          case "prefix":
            break;
          case "slashCommand": {
            client.loadSlash(ctx.options.category).forEach((result) => {
              embed.addField(result[0], result[1]);
            });
            break;
          }
          case "event": {
            client.loadAllEvents();
            break;
          }
          default:
            TypeError(`Category ${ctx.options.category} not exist.`);
        }
        ctx.send({ embeds: [embed], ephemeral: true });
      });
    else ctx.send({ content: "你沒有權限使用該指令" });
  }
};
