import { inlineCode, userMention } from "@discordjs/builders";
import {
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  Permissions,
  User,
} from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";

import { owner } from "../../constants/const.js";
import { bot } from "../../index.js";

const confirmBtn = new MessageButton({
  label: "確認",
  type: "BUTTON",
  style: "DANGER",
  customId: "cls-confirm",
});
const cancleBtn = new MessageButton({
  label: "取消",
  type: "BUTTON",
  style: "SECONDARY",
  customId: "cls-cancle",
});
const actionRow = new MessageActionRow().addComponents(confirmBtn, cancleBtn);

@Discord()
// @Guild([guilds.test])
class CleanMessage {
  private interactionTimeout?: NodeJS.Timeout;
  private number: number = 50;
  private targetId!: string;
  private excuting: boolean = false;

  private deleteMessage(ctx: CommandInteraction) {}

  @Slash("cls", {
    description: "刪除bot或特定使用者的訊息，私訊時僅能刪除bot自己的訊息",
  })
  async cleanMessage(
    @SlashOption("number", {
      description: "刪除的訊息數量，預設50",
      required: false,
    })
    num: number = 50,
    @SlashOption("user", {
      description: "要刪除的訊息使用者",
      required: false,
      type: "USER",
    })
    user: User | GuildMember,
    @SlashOption("id", {
      description: "無法以`user`指定使用者時的替代方案",
      required: false,
    })
    targetId: string,
    ctx: CommandInteraction,
  ) {
    await ctx.deferReply({ ephemeral: true });

    // premission check
    if (
      ctx.guildId &&
      !(
        ctx.memberPermissions?.has(Permissions.FLAGS.MANAGE_MESSAGES) ||
        ctx.user.id === owner
      )
    ) {
      await ctx.followUp({ content: "沒有權限使用該指令" });
      return;
    }
    if (this.excuting) {
      await ctx.followUp({ content: "請稍後再試" });
      return;
    }

    // DM
    if (!ctx.guild) targetId = bot.botId;
    else if (user) targetId = user.id;

    let content = `即將嘗試刪除${inlineCode(num.toString())}則${userMention(
      targetId,
    )}的訊息，該動作無法復原，確認執行指令嗎`;
    if (ctx.guild) content += "\n由於DC限制，最久僅能刪除14天前的訊息";

    await ctx.followUp({
      content,
      components: [actionRow],
    });

    // TODO
    this.interactionTimeout = setTimeout(
      async () => await ctx.editReply({ content: "超出時間，動作取消" }),
      10_000,
    );
  }

  @ButtonComponent("cls-confirm")
  async confirm(ctx: ButtonInteraction) {}

  @ButtonComponent("cls-cancle")
  async cancle(ctx: ButtonInteraction) {}
}
