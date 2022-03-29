const { DragonBot } = require('../base/dragonBot');
const { emojis, guilds } = require('../assets/const');
const { getMessagePayload } = require('../helpers/utils')

/**
 *
 * @param { DragonBot } client
 */
module.exports = async (client) => {
    client.on('messageCreate', async (msg) => {
        if(guilds.main.includes(msg.guildId) && !msg.author.bot) {
            if(msg.content.search(/https:\/\/(www\.)?(plurk|(fx)?twitter|pixiv)(\.(com|net))?.*/) != -1 || msg.attachments.size) {
                msg.react(emojis.saveMessage);
            }
        }
    });

    client.on('messageReactionAdd', async (reaction, user) => {
        if(guilds.main.includes(reaction.message.guildId) && !user.bot) {
            if(reaction.partial) {
                try {
                    await reaction.fetch();
                } catch(err) {
                    client.logger.error(err.message);
                }
            }

            if(reaction.emoji.name === emojis.saveMessage && !user.bot){
                try{
                    await user.send(getMessagePayload(reaction.message));
                }catch(err) {
                    client.logger.error(`訊息 ${reaction.message.url} 轉送失敗，${err.message}`);
                    const reply = await reaction.message.reply("該訊息因不明錯誤無法發送，或請檢察伺服器隱私設定\nhttps://i.imgur.com/BG9BvPP.png`");
                    setTimeout(() => reply.delete(), 5000);
                }
            }
        }
    });
}