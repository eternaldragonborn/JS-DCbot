import { userMention } from "@discordjs/builders";
import { EmbedBuilder, MessageReaction, User } from "discord.js";
import { Discord, Reaction } from "discordx";
import _ from "lodash";

import {
  channels,
  emojis,
  guilds,
  copyMessagePayload,
  deleteAfter,
} from "../constants";
import { BookRecord } from "../entities/book-record";
import { db, errorLogging, logger } from "../modules";

@Discord()
export class OnReaction {
  @Reaction({ emoji: emojis.snack, remove: false })
  async snack(reaction: MessageReaction, user: User) {
    logger.debug("snack emoji triggered");
    const message = reaction.message;

    if (!guilds.main.includes(message.guildId ?? "") || user.bot) return;

    // book
    if (Object.values(channels.book).includes(message.channelId)) {
      logger.debug("in book channel");

      await db.createContext(db.mongoEm, async (em) => {
        const book = await em.findOne(BookRecord, { _id: reaction.message.id });
        if (book) {
          logger.debug("is book message");

          let downloadLink: string;
          // get and update record
          try {
            downloadLink = book.url;

            book.users = _.uniq([...(book.users ?? []), userMention(user.id)]);
            await em.flush();
          } catch (e) {
            errorLogging("取得本本網址錯誤", { reason: e });
            await deleteAfter(
              reaction.message.channel.send(
                `${userMention(
                  user.id,
                )} 取得本本網址時發生錯誤，請稍後再試或進行回報`,
              ),
            );
            return;
          }

          // get and send info
          try {
            let payload = copyMessagePayload(reaction.message);

            if (payload.embeds) {
              const embed = EmbedBuilder.from(payload.embeds[0]);
              embed.addFields({ name: "下載", value: downloadLink });
              payload.embeds = [embed];
            } else payload.content += `\n下載：${downloadLink!}`;

            await user.send(payload).catch((e) => {
              deleteAfter(
                reaction.message.channel.send(
                  `${userMention(
                    user.id,
                  )}，無法私訊給你，請檢查伺服器隱私設定後重試。\nhttps://i.imgur.com/BG9BvPP.png`,
                ),
              );
            });
          } catch (e) {
            errorLogging("發送本本連結失敗", { reason: e });
            await deleteAfter(
              reaction.message.channel.send(
                `${userMention(
                  user.id,
                )} 發送本本連結失敗，請稍後再試或進行回報`,
              ),
            );
          }
        }
      });
    }
    // resend message
    else {
      logger.debug("resending message");
      try {
        await user.send(copyMessagePayload(message));
      } catch (reason: any) {
        await deleteAfter(
          message.reply({
            content: `${userMention(
              user.id,
            )} 該訊息因不明錯誤無法發送，或請檢查伺服器隱私設定\nhttps://i.imgur.com/BG9BvPP.png`,
            allowedMentions: { repliedUser: false },
          }),
        );
      }
    }
    logger.debug("---");
  }

  @Reaction({ emoji: emojis.deleteMessage, remove: false })
  async dmDeleteMessage(reaction: MessageReaction, user: User) {
    logger.debug(
      `delete emoji triggered, in guild: ${reaction.message.inGuild()}`,
    );
    if (!reaction.message.guildId) {
      // DM channel
      if (reaction.message.deletable) {
        await reaction.message.delete().catch((reason) => {
          user.send("刪除失敗");
          errorLogging("刪除DM訊息失敗", { reason, crit: true });
        });
      } else {
        await deleteAfter(
          user.send("無法刪除該訊息，可能因為不是由BOT發出或API限制"),
        );
      }
    }
    logger.debug("---");
  }
}
