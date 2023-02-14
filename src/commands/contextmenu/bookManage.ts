import { NotFoundError } from "@mikro-orm/core";
import {
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  ContextMenuCommandInteraction,
  InteractionReplyOptions,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import {
  ButtonComponent,
  ContextMenu,
  Discord,
  Guild,
  SelectMenuComponent,
} from "discordx";
import {
  channels,
  getResult,
  guilds,
  newMessageActionRow,
} from "../../constants";
import { BookRecord } from "../../entities/book-record";
import { logger, db } from "../../modules";
const actions = [
  { label: "查詢獲取過網址的使用者", value: "lookup" },
  { label: "刪除本本訊息", value: "delete" },
];

@Discord()
export class BookManage {
  private msgId?: string;
  private bookData?: BookRecord;

  private async getUserRecord(): Promise<string> {
    let result = "取得過該連結的使用者：\n";
    const users = this.bookData?.users;
    // logger.debug(`${users}: ${users.}`);
    if (!users) result += "無";
    else result += users.join("\n");

    return result;
  }

  private async deleteBookMsg(
    ctx: StringSelectMenuInteraction,
  ): Promise<string> {
    const fork = db.mongoEm.fork();
    let error: any;

    // delete record from database
    [, error] = await getResult(fork.removeAndFlush(this.bookData!));

    if (error) {
      logger.error("嘗試刪除紀錄時發生錯誤\n" + error);
      return "刪除資料時發生錯誤";
    }

    // delete message from channel
    try {
      const msg = await ctx.channel?.messages.fetch(this.msgId!);
      if (!msg || !msg?.deletable) {
        logger.error(`fetching target message(${this.msgId}) failed`);
      }

      await msg!.delete();
      return "已刪除";
    } catch (e: any) {
      logger.error(`failed to delete target message(${this.msgId})\n` + e);
      return "刪除訊息時發生錯誤，可嘗試手動刪除";
    }
  }

  //TODO: Button handler
  @ButtonComponent({ id: "delete_confirm" })
  async confirm(ctx: StringSelectMenuInteraction) {
    const result = await this.deleteBookMsg(ctx);
    await ctx.update({ content: result, components: [] });
  }

  @ButtonComponent({ id: "delete_cancel" })
  async cancel(ctx: StringSelectMenuInteraction) {
    await ctx.update({ content: "已取消", components: [] });
  }

  // select menu handler
  @SelectMenuComponent({ id: "book-action-menu" })
  async handle(ctx: StringSelectMenuInteraction) {
    const action = ctx.values[0];

    logger.debug(`selected action: ${action}`);
    await ctx
      .update({ content: "執行中", components: [] })
      .catch((e) => console.error("failed to update interaction", e));

    let result: InteractionReplyOptions;
    if (action === "lookup") {
      result = { content: await this.getUserRecord() };
    } else if (action === "delete") {
      const confirmBtn = new ButtonBuilder({
        label: "確認",
        custom_id: "delete_confirm",
        style: ButtonStyle.Danger,
      });
      const cancelBtn = new ButtonBuilder({
        label: "取消",
        custom_id: "delete_cancel",
        style: ButtonStyle.Secondary,
      });

      result = {
        content: "確認要刪除該紀錄嗎，該動作無法被復原",
        components: [
          newMessageActionRow().addComponents(confirmBtn, cancelBtn),
        ],
      };
    } else {
      result = { content: "未知的動作" };
    }

    // logger.debug(`${action} result: ${result}`);
    await ctx.deleteReply();
    await ctx.followUp({ ...result, ephemeral: true });
  }

  // context menu declare
  @ContextMenu({
    name: "訊息管理",
    type: ApplicationCommandType.Message,
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
  })
  @Guild(guilds.main)
  async bookManage(ctx: ContextMenuCommandInteraction) {
    if (!Object.values(channels.book).includes(ctx.channelId)) {
      await ctx.reply({ content: "目前此功能僅可用於本本", ephemeral: true });
      return;
    }

    this.msgId = ctx.targetId;
    // check if the message is in database
    const fork = db.mongoEm.fork();
    const [book, error] = await getResult(
      fork.findOneOrFail(BookRecord, { _id: this.msgId }),
    );
    if (error) {
      // failed to get record
      let content: string;
      if (error instanceof NotFoundError) content = "資料庫中無該訊息紀錄";
      else content = "嘗試取得資料庫時發生錯誤";

      await ctx.reply({ content, ephemeral: true });
      return;
    }

    this.bookData = book;
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("book-action-menu")
      .addOptions(actions);

    await ctx.reply({
      content: "要執行的動作",
      components: [newMessageActionRow().addComponents(selectMenu)],
      ephemeral: true,
    });
  }
}
