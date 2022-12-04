const {
  SlashCommand,
  ApplicationCommandPermissionType,
  CommandContext,
  ComponentType,
  ButtonStyle,
} = require("slash-create");
const { manager, roles, guilds, owner } = require("../../../constants/const");
const { redis, getRandomCode } = require("../../../helpers/database");
const { DateTime } = require("luxon");
const axios = require("axios").default;

module.exports = class SubscribeSystem extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: "geturl",
      description: "取得時效性網址",
      guildIDs: guilds.main,
      permissions: [
        {
          [guilds.furry]: [
            {
              type: ApplicationCommandPermissionType.ROLE,
              id: roles.subscriber,
              permission: true,
            },
          ],
        },
      ],
      deferEphemeral: true,
    });

    this.enabled = true;
    this.filePath = __filename;
  }

  /**
   *
   * @param { CommandContext } ctx
   */
  async run(ctx) {
    await ctx.defer(true);

    let userInfo = { id: ctx.user.id, status: 1 };
    const expire = Math.floor(DateTime.utc().plus({ minutes: 5 }).toSeconds());

    if (
      ctx.member.roles.includes(roles.subscriber) ||
      ctx.member.id === owner
    ) {
      const id = getRandomCode(7);
      userInfo.status = manager.includes(userInfo.id) ? 2 : 1;
      userInfo = JSON.stringify(userInfo);
      try {
        await axios.get("https://fafnir-the-dragon.herokuapp.com/api/status", {
          timeout: 5000,
        }); // test website status

        await ctx.send({
          content: `點擊下方按鈕開啟網頁，舊版網站暫時關閉。`, //，\n舊版網站連結將於 <t:${expire}:R>(<t:${expire}:T>) 過期`,
          ephemeral: true,
          components: [
            {
              type: ComponentType.ACTION_ROW,
              components: [
                {
                  type: ComponentType.BUTTON,
                  style: ButtonStyle.LINK,
                  url: "https://fafnir-the-dragon.herokuapp.com/subscribe-sys",
                  label: "新版網站(建議)",
                },
              ],
            },
          ],
        });
        await redis.set(id, userInfo, { EX: 300 });
      } catch (err) {
        console.log(err.message);
        await ctx.send({
          content: `網站目前無法使用，請稍後嘗試或通知 <@${owner}>`,
          ephemeral: true,
        });
      }
    } else {
      await ctx.send({ content: "無權使用該指令", ephemeral: true });
    }
  }
};
