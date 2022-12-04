import { blockQuote } from "@discordjs/builders";
import {
  Discord,
  Guard,
  Guild,
  SimpleCommand,
  SimpleCommandMessage,
  SimpleCommandOption,
  SimpleCommandOptionType,
} from "discordx";

import { channels, guilds, manager } from "../../constants/const.js";
import { deleteAfter } from "../../constants/utils.js";
import { BookRecord } from "../../entities/book-record.js";
import { NotBot } from "../../events/guards.js";
import { db } from "../../modules/database.js";
import { errorLogging, logger } from "../../modules/logger.js";

@Discord()
@Guard(NotBot)
@Guild(guilds.main)
export class Book {
  private async getRecord(ctx: SimpleCommandMessage) {
    try {
      await db.createContext(db.mongoEm, async (em) => {
        const record = await em.findOneOrFail(BookRecord, {
          _id: ctx.message.reference?.messageId,
        });

        await ctx.message.author.send(
          `取得過該本本連結名單：\n${blockQuote(
            record.users?.length ? record.users.join("\n") : "無",
          )}`,
        );
      });
    } catch (error: any) {
      errorLogging("取得本本紀錄失敗", { reason: error, crit: true });
      await deleteAfter(
        ctx.message.reply("取得記錄時發生錯誤，請稍後再試或進行回報"),
      );
    }
  }

  private async deleteBook(ctx: SimpleCommandMessage) {
    const bookMsg = await ctx.message.channel.messages.fetch(
      ctx.message.reference!.messageId!,
    );

    try {
      await db.createContext(db.mongoEm, async (em) => {
        // delete database record
        const book = await em.findOneOrFail(BookRecord, { _id: bookMsg.id });
        await db.redis.sRem("msg_ids", bookMsg.id);
        await em.removeAndFlush(book);
      });

      // delete message
      await bookMsg.delete();
      await deleteAfter(ctx.message.reply("本本資料已刪除"));
      logger.notice(`本本紀錄(${bookMsg.id})刪除`);
    } catch (reason) {
      await deleteAfter(ctx.message.reply("資料刪除失敗"));
      errorLogging(`刪除本本(${bookMsg.id})紀錄發生錯誤`, {
        reason,
        crit: true,
      });
    }
  }

  @SimpleCommand("book")
  async book(
    @SimpleCommandOption("action", {
      type: SimpleCommandOptionType.String,
      description: "record(取得拿過網址的使用者紀錄) / delete(刪除本本紀錄)",
    })
    action: string,
    ctx: SimpleCommandMessage,
  ) {
    const { author: user, channelId, reference: bookMsg } = ctx.message;

    if (channelId === channels.book.subscriber || channelId === channels.test) {
      // manager check
      if (!manager.includes(user.id))
        await deleteAfter(ctx.message.reply("該指令僅限管理員使用"));
      // no reply
      else if (!bookMsg?.messageId)
        await deleteAfter(ctx.message.reply("請reply目標本本訊息"));
      // book message check
      else if (await db.redis.sIsMember("msg_ids", bookMsg.messageId)) {
        if (action === "record") await this.getRecord(ctx);
        else if (action === "delete") await this.deleteBook(ctx);
        else
          await deleteAfter(
            ctx.message.reply(
              "指令用法：`+book` `動作`，動作可為`record`(列出取得本本網址的使用者)/`delete`(刪除本本資料)",
            ),
          );
      } else await deleteAfter(ctx.message.reply("無該訊息的本本紀錄"));

      await ctx.message.delete();
    }
  }
}
