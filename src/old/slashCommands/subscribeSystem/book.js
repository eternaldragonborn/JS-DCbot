const {
  SlashCommand,
  CommandOptionType,
  CommandContext,
} = require("slash-create");
const { manager, guilds } = require("../../../constants/const");

module.exports = class Redis extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: "book",
      description: "上傳本本",
      guildIDs: guilds.test,
      options: [
        {
          name: "message",
          description: "訊息ID(啟用開發者模式，並對訊息右鍵複製ID)",
          type: CommandOptionType.STRING,
          required: true,
        },
        {
          name: "url",
          description: "本本連結",
          type: CommandOptionType.STRING,
          required: true,
        },
      ],
    });

    this.filePath = __filename;
  }

  /**
   *
   * @param {CommandContext} ctx
   */
  async run(ctx) {}
};
