const { channels, emojis, guilds } = require("../assets/const");
const { DragonBot } = require("../base/dragonBot");
const { redis, mongo } = require("../helpers/database");
const { getMessagePayload } = require("../helpers/utils");

/**
 * @param {DragonBot} client
 */
module.exports = async (client) => {
  client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch();

    //#region main guild
    if (guilds.main.includes(reaction.message.guildId)) {
      //#region get bookURL
      if (
        Object.values(channels.book).includes(reaction.message.channelId) &&
        reaction.emoji.identifier === emojis.bookReaction
      ) {
        if (await redis.sIsMember("msg_ids", reaction.message.id)) {
          try {
            await mongo.connect();
            const collection = mongo.db("book-record").collection("books");
            /**
             * @type {{_id: string; url: string; users: string[]}}
             */
            const record = await collection
              .findOneAndUpdate(
                { _id: reaction.message.id },
                { $addToSet: { users: `<@${user.id}>` } },
              )
              .then((result) => result.value);

            if (!record) {
              await client.channels.fetch(reaction.message.channel);
              reaction.message.channel
                .send({ content: "無該本本的紀錄" })
                .then((msg) => setTimeout(() => msg.delete(), 7_000));
              client.logger.error(`無本本(${reaction.message.url})紀錄`);
              return;
            }
            let payload = getMessagePayload(reaction.message);
            if (payload.embeds) payload.embeds[0].addField("下載", record.url);
            else payload.content += `\n下載：${record.url}`;

            user.send(payload).catch((err) => {
              reaction.message.channel
                .send({
                  content: `<@${user.id}>，無法私訊給你，請檢查伺服器隱私設定。\nhttps://i.imgur.com/BG9BvPP.png`,
                })
                .then((msg) => setTimeout(() => msg.delete(), 5000));
            });
          } catch (err) {
            client.logger.error(
              `發送本本連結(${reaction.message.url})時發生錯誤，${err}`,
            );
            reaction.message.channel
              .send({ content: "發生未知錯誤" })
              .then((msg) => setTimeout(() => msg.delete(), 5000));
          } finally {
            mongo.close();
          }
        }
      }
      //#endregion

      //#region snack
      else if (reaction.emoji.name === emojis.saveMessage) {
        try {
          await user.send(getMessagePayload(reaction.message));
        } catch (err) {
          client.logger.error(
            `訊息 ${reaction.message.url} 轉送失敗，${err.message}`,
          );
          const reply = await reaction.message.reply({
            content: `<@${user.id}> 該訊息因不明錯誤無法發送，或請檢查伺服器隱私設定\nhttps://i.imgur.com/BG9BvPP.png`,
            allowedMentions: { repliedUser: false },
          });
          setTimeout(() => reply.delete(), 5000);
        }
      }
      //#endregion
    }
    //#endregion
  });
};
