import {userMention} from "@discordjs/builders";
import {MessageEmbed, MessageReaction, User} from "discord.js";
import {Discord, Reaction} from "discordx";
import _ from "lodash";

import {channels, emojis, guilds} from "../constants/const.js";
import {copyMessagePayload, deleteAfter} from "../constants/utils.js";
import {BookRecord} from "../entities/book-record.js";
import {bot} from "../index.js";
import {db} from "../modules/database.js";
import {errorLogging} from "../modules/logger.js";

@Discord()
export class OnReaction {
    @Reaction(emojis.snack, {remove: false})
    async snack(reaction: MessageReaction, user: User) {
        const message = reaction.message;

        if (!guilds.main.includes(message.guildId ?? "") || user.bot) return;

        // book
        if (Object.values(channels.book).includes(message.channelId)) {
            if (await db.redis.sIsMember("msg_ids", reaction.message.id)) {
                let downloadLink: string;
                // get and update record
                try {
                    await db.createContext(db.mongoEm, async (em) => {
                        const book = await em.findOneOrFail(BookRecord, {
                            _id: reaction.message.id,
                        });

                        downloadLink = book.url;
                        book.users!.push(`<@${user.id}>`);
                        book.users = _.uniq(book.users);

                        await em.flush();
                    });
                } catch (e) {
                    errorLogging("取得本本網址錯誤", {reason: e});
                    await deleteAfter(reaction.message.channel.send(`<@${user.id}> 取得本本網址時發生錯誤，請稍後再試或進行回報`))
                    return;
                }

                // get and send info
                try {
                    let payload = copyMessagePayload(reaction.message);

                    if (payload.embeds) {
                        const embed = new MessageEmbed(payload.embeds[0]);
                        embed.addField("下載", downloadLink!);
                        payload.embeds = [embed];
                    } else payload.content += `\n下載：${downloadLink!}`;

                    await user.send(payload).catch(e => {
                        deleteAfter(reaction.message.channel.send(`<@${user.id}>，無法私訊給你，請檢查伺服器隱私設定後重試。\nhttps://i.imgur.com/BG9BvPP.png`))
                    });
                } catch (e) {
                    errorLogging("發送本本連結失敗", {reason: e});
                    await deleteAfter(reaction.message.channel.send(`<@${user.id}> 發送本本連結失敗，請稍後再試或進行回報`));
                }
            }
        }
        // resend message
        else {
            try {
                await user.send(copyMessagePayload(message));
            } catch (reason: any) {
                await deleteAfter(
                    message.reply({
                        content: `${userMention(
                            user.id,
                        )} 該訊息因不明錯誤無法發送，或請檢查伺服器隱私設定\nhttps://i.imgur.com/BG9BvPP.png`,
                        allowedMentions: {repliedUser: false},
                    }),
                );
            }
        }
    }

    @Reaction(emojis.deleteMessage, {remove: false})
    async dmDeleteMessage(reaction: MessageReaction, user: User) {
        if (!reaction.message.guildId) {  // DM channel
            if (reaction.message.author === bot.user) {
                await reaction.message.delete().catch((reason) => {
                    user.send("刪除失敗");
                    errorLogging("刪除DM訊息失敗", {reason, crit: true});
                });
            } else {
                await deleteAfter(user.send("由於DC限制，私訊僅能刪除bot自己的訊息"));
            }
        }
    }
}
