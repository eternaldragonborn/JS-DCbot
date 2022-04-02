const { guilds, channels, emojis } = require("../assets/const");
const { DragonBot } = require("../base/dragonBot");
const { redis, mongo } = require("../helpers/database");

/**
 *
 * @param { DragonBot } client
 */
module.exports = async (client) => {
  client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    //#region guild
    if (guilds.main.includes(msg.guildId)) {
      //#region snack
      if (
        msg.content.search(
          /https:\/\/(www\.)?(plurk|(fx)?twitter|pixiv)(\.(com|net))?.*/,
        ) != -1 ||
        msg.attachments.size
      ) {
        msg.react(emojis.saveMessage);
      }
      //#endregion

      //#region prevent posting book url
      if (
        msg.channelId === channels.book.subscriber &&
        msg.content.match(/https?:\/\/([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?/)
      ) {
        await msg.delete();
        msg.channel
          .send(
            `<@${msg.author.id}>\n防止網址洩漏，請使用訂閱系統網站進行本本上傳`,
          )
          .then((msg) => setTimeout(msg.delete, 10_000));
      }
    }
    //#endregion
    else {
    }
  });

  client.on("messageDelete", async (msg) => {
    //#region bookMessage deleted
    if (
      Object.values(channels.book).includes(msg.channelId) &&
      (await redis.sIsMember("msg_ids", msg.id))
    ) {
      try {
        await redis.sRem("msg_ids", msg.id);
        await mongo.connect();
        const collection = mongo.db("book-record").collection("books");
        await collection.deleteOne({ _id: msg.id });
        client.logger.info(`本本紀錄(${msg.id})刪除`);
      } catch (err) {
        client.logger.error(`刪除本本紀錄(${msg.id})失敗，${err.message}`);
      }
    }
    //#endregion
  });
};
