import { userMention } from "@discordjs/builders";
import { MessageActionRow } from "discord.js";
import { Client, Discord, Guard, On } from "discordx";

import { channels, emojis, guilds, websiteButton } from "../constants/const.js";
import { copyMessagePayload, deleteAfter } from "../constants/utils.js";
import { NotBot } from "./guards.js";

import type { ArgsOf } from "discordx";
import { db } from "../modules/database.js";
import { BookRecord } from "../entities/book-record.js";
import { wrap } from "@mikro-orm/core";
import { errorLogging, logger } from "../modules/logger.js";

const snackRegex = new RegExp(
  /https:\/\/(www\.)?(plurk|(fx)?twitter|pixiv)(\.(com|net))?.*/,
);
const urlRegex = new RegExp(/https?:\/\/([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?/);

@Discord()
export class OnMessage {
  @On("messageCreate")
  @Guard(NotBot)
  async onCreate([msg]: ArgsOf<"messageCreate">, client: Client) {
    await client.executeCommand(msg);

    if (guilds.main.includes(msg.guildId ?? "")) {
      // snack
      if (msg.content.match(snackRegex) || msg.attachments.size) {
        await msg.react(emojis.snack);
      }

      // book channel url
      if (
        (msg.channelId === channels.book.subscriber ||
          msg.channelId === channels.book.test) &&
        msg.content.match(urlRegex)
      ) {
        await msg.delete();
        await deleteAfter(
          msg.channel.send({
            content: `${userMention(
              msg.author.id,
            )} 防止網址洩漏，請使用訂閱系統網站進行本本上傳`,
            components: [new MessageActionRow().addComponents(websiteButton)],
          }),
        );
      }
    }
  }

  // book info deleted
  @On("messageDelete")
  async onDelete([msg]: ArgsOf<"messageDelete">) {
    if (!Object.values(channels.book).includes(msg.channelId)) return;
    if (!(await db.redis.sIsMember("msg_ids", msg.id))) return;

    const warnMessage = `本本訊息(${msg.id})被刪除`;
    logger.warn(warnMessage);
    await msg.channel.send(warnMessage);

    // delete record from database
    await db.createContext(db.mongoEm, async (em) => {
      const book = await em.findOneOrFail(BookRecord, { _id: msg.id });
      await em.removeAndFlush(book);
      await db.redis.sRem("msg_ids", msg.id);
    });

    // unable to work because of partial
    /* // msg = await msg.fetch();
    try {
      // update message id in database
      db.createContext(db.mongoEm, async (em) => {
        const book = await em.findOneOrFail(BookRecord, { _id: msg.id });
        em.remove(book);

        // resend book info
        const newMessage = await msg.channel.send(copyMessagePayload(msg));
        await newMessage.react(emojis.snack);

        em.persist(em.create(BookRecord, { ...book, _id: newMessage.id }));
        await db.redis
          .multi()
          .sRem("msg_ids", msg.id)
          .sAdd("msg_ids", newMessage.id)
          .exec();
        await em.flush();
      });

      await deleteAfter(
        msg.channel.send(
          "該訊息為本本資訊，若要刪除請reply該訊息並使用 `+book delete`",
        ),
      );
    } catch (reason) {
      const errorMsg = `本本訊息(${msg.id})被刪除且重新發送及建檔失敗`;
      errorLogging(errorMsg, { reason, crit: true });
      await msg.channel.send(errorMsg);
    } */
  }
}
