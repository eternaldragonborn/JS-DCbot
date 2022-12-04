const {
  SlashCommand,
  CommandOptionType,
  ComponentType,
  ButtonStyle,
} = require("slash-create");
const client = require("../../..");
const { guilds } = require("../../../constants/const");

module.exports = class CommandName extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: "testcommand",
      description: "command description",
      guildIDs: [guilds.test], // 若無則為global command
      options: [],
      deferEphemeral: true, // optional
    });
    // this.enabled = false;
    this.filePath = __filename;
  }

  /**
   * @param { import("slash-create").CommandContext } ctx
   */
  async run(ctx) {
    await ctx.defer(true);
    await ctx.send({
      ephemeral: true,
      content: "test message",
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.BUTTON,
              custom_id: "test_button",
              label: "test",
              style: ButtonStyle.PRIMARY,
            },
          ],
        },
      ],
    });

    ctx.registerComponent("test_button", async (componentCtx) => {
      try {
        await componentCtx.message.delete();
      } catch (err) {
        client.logger.error(err.message);
      }
    });
  }
};
