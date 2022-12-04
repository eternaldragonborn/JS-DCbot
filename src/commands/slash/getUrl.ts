import { CommandInteraction, MessageActionRow } from "discord.js";
import { Discord, Guild, Slash } from "discordx";

import { guilds, websiteButton } from "../../constants/const.js";

@Discord()
@Guild(guilds.main)
export class GetSiteURL {
  @Slash("geturl", { description: "取得訂閱網站連結" })
  async geturl(ctx: CommandInteraction) {
    await ctx.reply({
      content: "點擊下方按鈕即可開啟網頁",
      components: [new MessageActionRow().addComponents(websiteButton)],
      ephemeral: true,
    });
  }
}
