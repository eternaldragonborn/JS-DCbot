import { Discord, Guild, SimpleCommand, SimpleCommandMessage } from "discordx";

import { guilds } from "../../constants/const.js";

@Discord()
@Guild(guilds.test)
export class Test {
  @SimpleCommand("test")
  async test(ctx: SimpleCommandMessage) {
    await ctx.message.reply("This is a test command.");
  }
}
