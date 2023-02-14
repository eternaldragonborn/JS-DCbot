import { ActionRowBuilder, userMention } from "@discordjs/builders";
import { MessageActionRowComponentBuilder } from "discord.js";
import { Client, Discord, Guard, On } from "discordx";

import {
  channels,
  emojis,
  guilds,
  websiteButton,
  deleteAfter,
} from "../constants";
import { NotBot } from "./guards";

import type { ArgsOf } from "discordx";
import { db, logger } from "../modules";
import { BookRecord } from "../entities/book-record";

const snackRegex = new RegExp(
  /https:\/\/(www\.)?(plurk|(fx)?twitter|pixiv)(\.(com|net))?.*/,
);
const urlRegex = new RegExp(/https?:\/\/([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?/);

@Discord()
export class OnMessage {
  @On({ event: "messageCreate" })
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
            components: [
              new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                websiteButton,
              ),
            ],
          }),
        );
      }
    }
  }

  // book info deleted
  // @On({ event: "messageDelete" })
  // async onDelete([msg]: ArgsOf<"messageDelete">) {
  //   if (!Object.values(channels.book).includes(msg.channelId)) return;
  //   if (!(await db.redis.sIsMember("msg_ids", msg.id))) return;

  //   const warnMessage = `本本訊息(${msg.id})被刪除`;
  //   logger.warn(warnMessage);
  //   await msg.channel.send(warnMessage);

  //   // delete record from database
  //   await db.createContext(db.mongoEm, async (em) => {
  //     const book = await em.findOneOrFail(BookRecord, { _id: msg.id });
  //     await em.removeAndFlush(book);
  //     await db.redis.sRem("msg_ids", msg.id);
  //   });
  // }
}
