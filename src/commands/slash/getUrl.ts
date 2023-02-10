import {
  ActionRowBuilder,
  CommandInteraction,
  MessageActionRowComponentBuilder,
} from "discord.js";
import { Discord, Guild, Slash } from "discordx";

import { guilds, websiteButton } from "../../constants";

@Discord()
@Guild(guilds.main)
export class GetSiteURL {
  @Slash({ name: "geturl", description: "取得訂閱網站連結" })
  async geturl(ctx: CommandInteraction) {
    await ctx.reply({
      content: "點擊下方按鈕即可開啟網頁",
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
          websiteButton,
        ]),
      ],
      ephemeral: true,
    });
  }
}
