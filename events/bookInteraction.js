const { channels, emojis } = require("../assets/const");
const { DragonBot } = require("../base/dragonBot");
const { redis, mongo } = require("../helpers/database");
const { getMessagePayload } = require("../helpers/utils");

/**
 * @param {DragonBot} client
 */
module.exports = async (client) => {
  client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.partial) await reaction.fetch();

    if (
      Object.values(channels.book).includes(reaction.message.channelId) &&
      reaction.emoji.identifier === emojis.bookReaction &&
      !user.bot
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

          let payload = { content: "" };
          if (reaction.message.embeds.length)
            payload.embeds = reaction.message.embeds;
          else {
            payload = getMessagePayload(reaction.message);
          }
          payload.content += `\n下載：${record.url}`;
          user.send(payload).catch((err) => {
            reaction.message.channel
              .send({
                content: `<@${user.id}>，無法私訊給你，請檢查伺服器隱私設定。\nhttps://i.imgur.com/BG9BvPP.png`,
              })
              .then((msg) => setTimeout(() => msg.delete(), 5000));
          });
        } catch (err) {
          client.logger.error("發送本本連結時發生錯誤， " + err.message);
          reaction.message.channel
            .send({ content: "發生未知錯誤" })
            .then((msg) => setTimeout(() => msg.delete(), 5000));
        } finally {
          mongo.close();
        }
      }
    }
  });

  client.on("messageDelete", async (msg) => {
    if (
      Object.values(channels.book).includes(reaction.message.channelId) &&
      (await redis.sIsMember("msg_ids", msg.id))
    ) {
      try {
        await mongo.connect();
        const collection = mongo.db("book-record").collection("books");
        await collection.deleteOne({ _id: msg.id });
        client.logger.info(`本本紀錄(${msg.id})刪除`);
      } catch (err) {
        client.logger.error(`刪除本本紀錄(${msg.id})失敗，${err.message}`);
      }
    }
  });
};
