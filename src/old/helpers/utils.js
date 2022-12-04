const { Message } = require("discord.js");

/**
 *
 * @param { Message } message
 * @returns { import("discord.js").MessageOptions }
 */
const getMessagePayload = (message) => {
  /**
   * @type { import("discord.js").MessageOptions }
   */
  const payload = { content: message.content + "\n", files: [] };
  if (message.attachments) {
    let size = 0;
    message.attachments.forEach((v) => {
      size += v.size;
      payload.files.push(v.attachment);
    });
    if (size >= 7.5 * 1024) {
      payload.files = [];
      message.attachments.forEach(
        (v) => (payload.content += `${v.proxyURL}\n`),
      );
    }
  }
  if (message.embeds.length) payload.embeds = message.embeds;
  return payload;
};

module.exports = { getMessagePayload };
